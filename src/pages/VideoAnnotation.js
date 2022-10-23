import React, { useCallback, useRef } from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppConfig } from "../config/AppConfig";
import Nav from "../components/Nav";
import axios from "axios";

const BASE_API_URL = AppConfig.baseApiURL;

function VideoAnnotation() {
    const { url } = useParams();
    const [Count, setCount] = useState(1);
    const [annotation, setAnnotation] = useState([]);
    const [trackTest, setTrackTest] = useState(null);
    const [Duration, setDuration] = useState(0);
    const progressRef = useRef();
    const [currentTime, setCurrentTime] = useState(0);
    // for video
    const [videoInfo, setVideoInfo] = useState({});
    const videoRef = useRef(null);
    const [StartTime, setStratTime] = useState(0);
    const [EndTime, setEndTime] = useState(0);

    // preview stop time
    const [WhereToStop, setWhereToStop] = useState(0);

    // for meta key, value , handler & map to display
    const [MetaKey, setMetaKey] = useState("");
    const [MetaValue, setMetaValue] = useState("");
    const [Meta, setMeta] = useState([]);
    const handleMetaKey = (e) => {
        setMetaKey(e.target.value);
    };
    const handleMetaValue = (e) => setMetaValue(e.target.value);
    const handleAddMeta = () => {
        setMeta([
            ...Meta,
            { id: Count, key: MetaKey, value: MetaValue, [MetaKey]: MetaValue },
        ]);
        setMetaKey("");
        setMetaValue("");
        setCount((prev) => prev + 1);
    };
    const handleDeleteMeta = (id) => setMeta(Meta.filter((v) => v.id !== id));

    const metaTableData = Meta.map((v) => {
        return (
            <tr key={v.id}>
                <td>{v.key}</td>
                <td>{v.value}</td>
                <td width="20">
                    <button className='btn btn-sm btn-danger' onClick={() => handleDeleteMeta(v.id)}>Delete</button>
                </td>
            </tr>
        );
    });
    // ---- end meta

    // get timestamp from sec
    const getStringFromMS = (ms, res = []) => (
        [1000, 60, 60, 24].reduce((rest, curr, i) => (
            res[3 - i] = rest % curr, Math.floor(rest / curr)
        ), ms), res.join(":")
    );
    // keyboard event handling
    const handleKeyPress = useCallback(
        (event) => {
            const tmp = event.keyCode;
            // event.preventDefault();
            switch (tmp) {
                case 37: // left
                    if (videoInfo.videoUrl) videoRef.current.currentTime -= 0.01;
                    break;
                case 39: // right
                    if (videoInfo.videoUrl) videoRef.current.currentTime += 0.01;
                    break;
                case 32: // space
                    if (videoRef.current.paused || videoRef.current.ended)
                        videoRef.current.play();
                    else videoRef.current.pause();
                    // remove auto scroll after pressing scroll bar
                    if(event.target == document.body) event.preventDefault();
                    break;
                case 83: // s
                    setStratTime(videoRef.current.currentTime);
                    break;
                case 69: // e
                    setEndTime(videoRef.current.currentTime);
                    videoRef.current.pause();
                    break;
                default:
            }
        },
        [videoInfo.videoUrl]
    );
    useEffect(() => {

    }, [videoInfo])
    useEffect(() => {
        // attach the event listener
        document.addEventListener("keydown", handleKeyPress);
        // remove the event listener
        return () => {
            document.removeEventListener("keydown", handleKeyPress);
        };
    }, [handleKeyPress]);
    // ---- end keyborad event

    // get selected text
    const handleMouseUp = () => {
        const selectedText = getSelectedText();
        const startIndex = window.getSelection().anchorOffset;
        const endIndex = window.getSelection().focusOffset;
        console.log(
            window.getSelection().anchorOffset,
            window.getSelection().focusOffset
        );
        if (startIndex === endIndex) return;
        // const text = selectedText + "[" + startIndex + ", " + endIndex + "]";
        // tsi = text start index, vst = video start time
        const temp = {
            id: Count,
            word: selectedText,
            tsi: startIndex,
            tse: endIndex,
            vst: StartTime,
            vet: EndTime,
        };
        setCount((prev) => prev + 1);
        // make list of annotation
        setAnnotation([...annotation, temp]);
        console.log(annotation);
        // generate srt
        trackTest.addCue(new VTTCue(temp.vst, temp.vet, temp.word));
    };
    const getSelectedText = () => {
        if (window.getSelection) {
            // console.log(window.getSelection().anchorOffset, window.getSelection().focusOffset);
            return window.getSelection().toString();
        } else if (document.selection) {
            // console.log(window.getSelection().anchorOffset, window.getSelection().focusOffset);
            return document.selection.createRange().text;
        }
        return "";
    };
    // delete annotation
    const annotationDeleteHandler = (id) => {
        // eslint-disable-next-line
        let [temp, ...x] = annotation.filter((v) => v.id === id);
        setAnnotation(annotation.filter((v) => v.id !== id));
        // after deleteing word we have to delete srt
        for (const cue of trackTest.cues) {
            if (
                cue.endTime === temp.vet &&
                cue.startTime === temp.vst &&
                cue.text === temp.word
            ) {
                trackTest.removeCue(cue);
            }
        }
    };

    const annotationPreviewHandler = (s, e) => {
        document.activeElement.blur()
        videoRef.current.currentTime = s;
        setWhereToStop(e);
        videoRef.current.play();

    };
    const handleVideoMetaData = (e) => {
        let htmlVideo = document.getElementById(e.target.id);
        const track = htmlVideo.addTextTrack("captions", "English", "en");
        track.mode = "showing";
        setTrackTest(track);
        // set duration
        setDuration(htmlVideo.duration)
    };
    const tableData = annotation.map((v) => {
        return (
            <tr key={v.id}>
                <td>{v.word}</td>
                <td>{(getStringFromMS(v.vst * 1000).split('.'))[0]}</td>
                <td>{(getStringFromMS(v.vet * 1000).split('.'))[0]}</td>
                <td width="50" className="text-nowrap">
                    <button className='btn btn-sm btn-outline-dark me-2' onClick={() => annotationPreviewHandler(v.vst, v.vet)}>
                        <i class="fa-sharp fa-solid fa-eye"></i>
                    </button>
                    <button className='btn btn-sm btn-danger' onClick={() => annotationDeleteHandler(v.id)}>
                        <i class="fa-sharp fa-solid fa-xmark"></i>
                    </button>
                </td>
            </tr>
        );
    });
    const submitHandler = () => {
        const data = {
            VideoId: url,
            signText: videoInfo.signText,
            naturalText: videoInfo.naturalText,
            video: videoInfo.videoUrl,
            annotation: [...annotation],
            meta: [...Meta],
            annotationStartTime: videoInfo.StartTime,
            annotationEndTime: new Date(),
            totalTimeSpend: (new Date() - videoInfo.StartTime) / 1000
        };
        axios.post(`${BASE_API_URL}/save`, data)
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            })
    };
    useEffect(() => {
        const link = `${BASE_API_URL}/videos/${url}`;
        axios
            .get(link)
            .then((res) => {

                const data = res.data;
                console.log('data', data);
                setVideoInfo({
                    id: data.Sl,
                    signText: data.gloss,
                    naturalText: data.bangla,
                    selectedGloss: data.select_gloss,
                    videoUrl: process.env.PUBLIC_URL + "/videos/" + data.Sl + ".mp4",
                    StartTime: new Date(),
                });
            })
            .catch((err) => {
                console.log(err);
            });
    }, [url]);
    // useEffect(()=>{
    //     console.log('info',videoInfo);
    // },[videoInfo])
    const words = videoInfo.selectedGloss ? videoInfo.selectedGloss : [];
    const handleWords = (word) => {
        document.activeElement.blur()
        if (StartTime === EndTime || StartTime > EndTime) return;
        for (let index = 0; index < annotation.length; index++) {
            const element = annotation[index];
            if ((StartTime >= element.vst && StartTime < element.vet) || (EndTime > element.vst && EndTime <= element.vet)) {
                return;
            }

        }

        const temp = {
            id: Count,
            word: word,
            vst: StartTime,
            vet: EndTime,
        };
        setCount((prev) => prev + 1);
        // make list of annotation
        setAnnotation([...annotation, temp]);
        console.log(annotation);
        // generate srt
        trackTest.addCue(new VTTCue(temp.vst, temp.vet, temp.word));
    }
    const keyUpHandler = (e) => {
        console.log('key pressed');
        e.preventDefault();
    }
    const keywords = words.map(v => <button className='btn btn-sm btn-light' onKeyUp={(e) => {
        e.preventDefault();
    }} onClick={() => handleWords(v)}>{v}</button>)
    const progressHandler = (e) => {
        videoRef.current.currentTime = e.target.value;
    }


    const getVideoTime = () => {
        const time = videoRef.current.currentTime;
        setCurrentTime(time)
        progressRef.current.value = time;
        console.log(WhereToStop, videoRef.current.currentTime);
        if (WhereToStop != 0 && videoRef.current.currentTime >= WhereToStop) {
            setWhereToStop(0);
            videoRef.current.pause();
        }

    }


    return (
        <>
            {/* {url} */}
            <Nav />

            <div className="container py-4">
                <div className="row">
                    <aside className="col-md-8 my-2">
                        {/* <p className="text-center" id="signtext" onMouseUp={handleMouseUp}>
                            {videoInfo.signText}
                        </p> */}
                        <header className="mb-3">
                            <p className="mb-1" id="signtext">
                                <strong className="d-block">Natural Bangla:</strong>
                                <span>{videoInfo.naturalText}</span>
                            </p>
                            <p className="mb-1" id="signtext">
                                <strong className="d-block">Sign Supported Gloss:</strong>
                                <span>{videoInfo.signText}</span>
                            </p>
                        </header>
                        <section className="bg-secondary d-flex flex-column justify-content-center align-items-center p-4 rounded-top">
                            {videoInfo.videoUrl && (
                                <div className="w-100 position-relative">
                                    <div className="ratio ratio-16x9">
                                        <video className="bg-light rounded ratio ratio-16x9"
                                            id="myVideo"
                                            key={videoInfo.videoUrl}
                                            ref={videoRef}
                                            width="592"
                                            height="333"
                                            onLoadedMetadata={handleVideoMetaData}
                                            onTimeUpdate={getVideoTime}
                                        >
                                            <source src={videoInfo.videoUrl} type="video/mp4" />
                                        </video>
                                    </div>

                                    {/* <span style={{ float: 'left' }}>{currentTime}</span> */}
                                    <span className="position-absolute top-0 start-50 translate-middle bg-light lh-1 p-1 px-2 rounded shadow">{(getStringFromMS(currentTime * 1000).split('.'))[0]}/{(getStringFromMS(Duration * 1000).split('.'))[0]}</span>
                                    <input type="range" ref={progressRef} style={{ width: '100%' }} id="vol" name="vol" min="0" max={Duration} step="0.01" onChange={progressHandler}></input>
                                    <div id="showWord" style={{ height: '48px' }} className="position-relative bg-light overflow-hidden rounded">
                                        {annotation.map(v => {
                                            const duration = videoRef.current.duration;
                                            const elem = document.getElementById('showWord')
                                            const value = (elem.offsetWidth / duration);
                                            const marginleft = value * v.vst;
                                            const width = value * (v.vet - v.vst);
                                            const mystyle = {
                                                marginLeft: Math.ceil(marginleft) + "px",
                                                width: Math.ceil(width) + "px",
                                                background: '#abf7b1',
                                                overflow: 'hidden',
                                                textAlign: 'center',
                                                position: 'absolute',
                                                height: '48px'
                                            };
                                            return (
                                                <div style={mystyle} className="d-flex flex-wrap flex-column justify-content-center lh-1">
                                                    <span className="d-block text-nowrap mb-1" style={{fontSize: '13px'}}>{v.word}</span>
                                                    <span className="d-block text-nowrap" style={{fontSize: '12px'}}>
                                                        {(getStringFromMS((v.vet - v.vst) * 1000).split('.'))[0]}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Annotation Controls */}
                            <div className="d-flex align-items-center justify-content-center w-100 pt-3 gap-2">
                                {videoInfo.videoUrl && videoRef.current && (
                                    <>
                                        {(videoRef.current.paused || videoRef.current.ended) &&
                                            <button title="play" className='btn btn-sm btn-info' onClick={() => videoRef.current.play()}>
                                                <i class="fa-solid fa-play"></i>
                                            </button>
                                        }
                                        {!(videoRef.current.paused || videoRef.current.ended) &&
                                            <button title="pause the playback" className='btn btn-sm btn-info' onClick={() => videoRef.current.pause()}>
                                                <i class="fa-solid fa-stop"></i>
                                            </button>
                                        }
                                    </>
                                )}
                                {/* {videoRef && (videoRef.current.paused || videoRef.current.ended) &&
                                    <button title="play" className='btn btn-outline-info' onClick={() => videoRef.current.play()}>&#9658;</button>
                                }
                                {videoRef && !(videoRef.current.paused || videoRef.current.ended) &&
                                    <button title="pause the playback" className='btn btn-outline-info' onClick={() => videoRef.current.pause()}>&#x23F8;</button>
                                } */}

                                <button title="stop video" className='btn btn-sm btn-info'
                                    onClick={() => {
                                        videoRef.current.playbackRate = 1
                                        videoRef.current.pause();
                                        videoRef.current.currentTime = 0;
                                    }}
                                >
                                    <i class="fa-solid fa-stop"></i>
                                </button>
                                <button title="slow this video" className='btn btn-sm btn-outline-info' onClick={() => (videoRef.current.playbackRate -= 0.1)}>
                                    Slow
                                </button>
                                <button title="take annotation start time" className='btn btn-sm btn-outline-info'
                                    onClick={() => setStratTime(videoRef.current.currentTime)}
                                >
                                    Start {(getStringFromMS(StartTime * 1000).split('.'))[0]}
                                </button>
                                <button title="take annotation end time" className='btn btn-sm btn-outline-info'
                                    onClick={() => {
                                        setEndTime(videoRef.current.currentTime);
                                        videoRef.current.pause();
                                    }}
                                >
                                    End {(getStringFromMS(EndTime * 1000).split('.'))[0]}
                                </button>
                                <button title="fast this video" className='btn btn-sm btn-outline-info' onClick={() => (videoRef.current.playbackRate += 0.1)}>
                                    Fast
                                </button>
                                <button title="reset video playback" className='btn btn-sm btn-outline-info' onClick={() => {
                                    videoRef.current.playbackRate = 1
                                }}>
                                    <i class="fa-solid fa-arrows-rotate"></i>
                                </button>
                            </div>
                        </section>

                        <section className="d-flex align-items-center justify-content-center p-3 rounded-bottom border gap-2">
                            {keywords}
                        </section>

                        <button className="btn btn-block btn-success w-100 mt-3" onClick={submitHandler}>
                            Save Annotation
                        </button>
                    </aside>

                    <aside className="col-md-4 mx-auto my-2">
                        <section className="mb-5">
                            <h1 className="fs-5">Insert New Meta</h1>
                            <div className="mb-2 form-group">
                                <label htmlFor="key">Key</label>
                                <input
                                    type="text"
                                    onChange={handleMetaKey}
                                    name="key"
                                    className="form-control form-control-sm"
                                    value={MetaKey}
                                    id="key"
                                    placeholder="Enter key"
                                />
                            </div>
                            <div className="mb-3 form-group">
                                <label htmlFor="value">Value</label>
                                <input
                                    type="text"
                                    onChange={handleMetaValue}
                                    name="value"
                                    className="form-control form-control-sm"
                                    value={MetaValue}
                                    id="value"
                                    placeholder="Enter value"
                                />
                            </div>
                            <button className='btn btn-success btn-sm w-100' type="submit" onClick={handleAddMeta}>
                                Add New Meta
                            </button>
                        </section>

                        <section className="mb-5">
                            <h1 className="fs-5">Meta Table</h1>
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Key</th>
                                        <th>Value</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metaTableData ? metaTableData : null}</tbody>
                            </table>
                        </section>

                        <section className="mb-5">
                            <h1 className="fs-5">Annotation Table</h1>
                            <table
                                className="table table-sm"
                                style={{ margin: "0px auto", padding: "5%" }}
                            >
                                <thead>
                                    <tr>
                                        <th>Word</th>
                                        <th width="25%">Video Start</th>
                                        <th width="25%" >Video End</th>
                                        <th width="25">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData ? tableData : null}
                                </tbody>
                            </table>
                        </section>
                    </aside>
                </div>
            </div>
        </>
    );
}

export default VideoAnnotation;
