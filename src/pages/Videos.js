import React, { useEffect, useReducer, useState } from "react";
import { Link } from "react-router-dom";
import AnnotationActions from "../actions/AnnotationActions";
import Nav from "../components/Nav";
import AnnotationReducers from "../reducers/AnnotationReducer";
import video from "../utilities/demoVideoItem";
import axios from 'axios'
const Videos = () => {
    const [GetVideos, setGetVideos] = useState([]);
    // const [state, dispatch] = useReducer(AnnotationReducers, GetVideos);

    useEffect(() => {
        axios
            .get("http://localhost:4000/videos")
            .then((res) => {
                setGetVideos([...res.data.json])
                console.log(process.env.PUBLIC_URL+"/videos/SD17DSAT12S1.mp4");
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    useEffect(() => {
        console.log("state", GetVideos);
    }, [GetVideos]);

    const allVideo = GetVideos.map((v, i) => (
        <Link
            to={"/videos/" + i}
            className="list-group-item list-group-item-action flex-column align-items-start "
        >
            <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">{v.bangla }</h5>
                <small>{v.timestamp}</small>
            </div>
            <p className="mb-1">Gloss: {v.gloss}</p>
            <small>Topic: {v.Topic}</small>
        </Link>
    ));
    return (
        <>
            <Nav />
            <div className="container">
                <div className="row">
                    <div className="col-md-8 mx-auto">
                        <h2 className="my-2">All Videos</h2>
                        <div className="list-group">{allVideo}</div>
                        {/* <button className="btn btn-info my-2">Load more</button> */}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Videos;
