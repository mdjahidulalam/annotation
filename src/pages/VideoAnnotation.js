import React, { useCallback, useRef } from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Nav from "../components/Nav";
import axios from "axios";

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
                <td>
                    <button className='btn btn-outline-info' onClick={() => handleDeleteMeta(v.id)}>Delete</button>
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
        videoRef.current.currentTime = s;
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
                <td>
                    <button className='btn btn-outline-info' onClick={() => annotationPreviewHandler(v.vst, v.vet)}>
                        Preview
                    </button>
                    <button className='btn btn-outline-info' onClick={() => annotationDeleteHandler(v.id)}>Delete</button>
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
        axios.post('http://192.168.1.34:4000/save', data)
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            })
    };
    useEffect(() => {
        const link = `http://192.168.1.34:4000/videos/${url}`;
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
    const keyUpHandler = (e) =>{
        console.log('key pressed');
        e.preventDefault();
    }
    const keywords = words.map(v => <button className='btn btn-outline-info' onKeyUp={(e) => {
        e.preventDefault();
    }} onClick={() => handleWords(v)}>{v}</button>)
    const progressHandler = (e) => {
        videoRef.current.currentTime = e.target.value;
    }


    const getVideoTime = () => {
        const time = videoRef.current.currentTime;
        setCurrentTime(time)
        progressRef.current.value = time;

    }


    return (
        <>
            {/* {url} */}
            <Nav />

            <div className="container">
                <div className="row">
                    <div className="col-md-8 my-2">
                        {/* <p className="text-center" id="signtext" onMouseUp={handleMouseUp}>
                            {videoInfo.signText}
                        </p> */}
                        <p className="text-center" id="signtext">
                            Natural Bangla: {videoInfo.naturalText}
                        </p>
                        <p className="text-center" id="signtext">
                            Sign supported gloss: {videoInfo.signText}
                        </p>
                        <div
                            className="mx-auto"
                            style={{
                                display: "flex",
                                alignItem: "center",
                                justifyContent: "center",
                            }}
                        >
                            {videoInfo.videoUrl && (
                                <div style={{marginBottom:'-1050px'}}>
                                    <video
                                        id="myVideo"
                                        key={videoInfo.videoUrl}
                                        ref={videoRef}
                                        width="100%"
                                        height="20%"
                                        onLoadedMetadata={handleVideoMetaData}
                                        onTimeUpdate={getVideoTime}
                                    >
                                        <source src={videoInfo.videoUrl} type="video/mp4" />
                                    </video>

                                    {/* <span style={{ float: 'left' }}>{currentTime}</span> */}
                                    <span style={{ float: 'right' }}>{(getStringFromMS(currentTime * 1000).split('.'))[0]}/{(getStringFromMS(Duration * 1000).split('.'))[0]}</span>

                                    <input type="range" ref={progressRef} style={{ width: '100%' }} id="vol" name="vol" min="0" max={Duration} step="0.01" onChange={progressHandler}></input>
                                    <div id="showWord" style={{ backgroundColor: 'rgba(0,0,0,.05)',height:'48px' }}>
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
                                            };
                                            return (
                                                <div style={mystyle}>
                                                    {v.word}
                                                    <span style={{display:'block'}}>
                                                        {(getStringFromMS((v.vet - v.vst) * 1000).split('.'))[0]}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <br />
                        <div
                            className="mt-5"
                            style={{
                                display: "flex",
                                alignItem: "center",
                                justifyContent: "center",
                            }}
                        >
                            {videoInfo.videoUrl && videoRef.current && (
                                <>
                                    {(videoRef.current.paused || videoRef.current.ended) &&
                                        <button title="play" className='btn btn-outline-info' onClick={() => videoRef.current.play()}>&#9658;</button>
                                    }
                                    {!(videoRef.current.paused || videoRef.current.ended) &&
                                        <button title="pause the playback" className='btn btn-outline-info' onClick={() => videoRef.current.pause()}>&#x23F8;</button>
                                    }
                                </>
                            )}
                            {/* {videoRef && (videoRef.current.paused || videoRef.current.ended) &&
                                <button title="play" className='btn btn-outline-info' onClick={() => videoRef.current.play()}>&#9658;</button>
                            }
                            {videoRef && !(videoRef.current.paused || videoRef.current.ended) &&
                                <button title="pause the playback" className='btn btn-outline-info' onClick={() => videoRef.current.pause()}>&#x23F8;</button>
                            } */}

                            <button title="slow this video" className='btn btn-outline-info' onClick={() => (videoRef.current.playbackRate -= 0.1)}>
                                Slow
                            </button>
                            <button title="take annotation start time" className='btn btn-outline-info'
                                onClick={() => setStratTime(videoRef.current.currentTime)}
                            >
                                start {(getStringFromMS(StartTime * 1000).split('.'))[0]}
                            </button>
                            <button title="take annotation end time" className='btn btn-outline-info'
                                onClick={() => {
                                    setEndTime(videoRef.current.currentTime);
                                    videoRef.current.pause();
                                }}
                            >
                                end {(getStringFromMS(EndTime * 1000).split('.'))[0]}
                            </button>
                            <button title="fast this video" className='btn btn-outline-info' onClick={() => (videoRef.current.playbackRate += 0.1)}>
                                Fast
                            </button>
                            <button title="reset video playback" className='btn btn-outline-info' onClick={() => {
                                videoRef.current.playbackRate = 1
                            }}>
                                &#8634;
                            </button>
                            <button title="stop video" className='btn btn-outline-info'
                                onClick={() => {
                                    videoRef.current.playbackRate = 1
                                    videoRef.current.pause();
                                    videoRef.current.currentTime = 0;

                                }}
                            >
                                &#x23F9;
                            </button>
                        </div>

                        <div className=""
                            style={{
                                display: "flex",
                                alignItem: "center",
                                justifyContent: "center",
                            }}
                        >
                            <button className="btn btn-info-success">Gloss words - </button> {keywords}
                        </div>

                        {/* annotation table */}
                        {/* <table
                            className="table-sm table-striped"
                            style={{ margin: "0px auto", padding: "5%" }}
                        >
                            <thead>
                                <tr>
                                    <th>Word</th>
                                    <th>Video start</th>
                                    <th>Video end</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>{tableData ? tableData : null}</tbody>
                        </table> */}
                    </div>

                    <div className="col-md-4 mx-auto my-2">
                        <div className="form-group">
                            <label htmlFor="key">Key</label>
                            <input
                                type="text"
                                onChange={handleMetaKey}
                                name="key"
                                className="form-control"
                                value={MetaKey}
                                id="key"
                                placeholder="Enter key"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="value">Value</label>
                            <input
                                type="text"
                                onChange={handleMetaValue}
                                name="value"
                                className="form-control"
                                value={MetaValue}
                                id="value"
                                placeholder="Enter value"
                            />
                        </div>
                        <button className='btn btn-outline-info'
                            type="submit"
                            onClick={handleAddMeta}
                        >
                            Add
                        </button>

                        <h3>Meta table</h3>
                        <table className="table-sm table-striped">
                            <thead>
                                <tr>
                                    <th>key</th>
                                    <th>Value</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>{metaTableData ? metaTableData : null}</tbody>
                        </table>
                        <div>
                            <h3>Annotation Table</h3>
                            <table
                                className="table-sm table-striped"
                                style={{ margin: "0px auto", padding: "5%" }}
                            >
                                <thead>
                                    <tr>
                                        <th>Word</th>
                                        <th>Video start</th>
                                        <th>Video end</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>{tableData ? tableData : null}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <button className="btn btn-info" onClick={submitHandler}>
                    Submit
                </button>
            </div>
        </>
    );
}

export default VideoAnnotation;
