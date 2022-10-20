import React, { useEffect, useReducer, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../components/Nav";
import axios from "axios";
const Complete = () => {
    const [GetVideos, setGetVideos] = useState([]);

    useEffect(() => {
        axios
            .get("http://192.168.1.34:4000/complete")
            .then((res) => {
                console.log(res.data);
                setGetVideos([...res.data]);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    useEffect(() => {
        console.log("state", GetVideos);
    }, [GetVideos]);

    const allVideo = GetVideos.map((v) => {
        const temp = JSON.parse(v.json);
        return (
            <Link
                title="click to watch/annotate same video"
                to={"/videos/" + temp.VideoId}
                className="list-group-item list-group-item-action flex-column align-items-start "
            >
                <div className="d-flex w-100 justify-content-between">
                    <h5 className="mb-1">{temp.video}</h5>
                    <small>{v.timestamp}</small>
                </div>
                <p className="mb-1">{temp.signText}</p>
                <small>{temp.naturalText}</small>
            </Link>
        );
    });
    return (
        <>
            <Nav />
            <div className="container">
                <div className="row">
                    <div className="col-md-8 mx-auto">
                        <h2 className="my-2">All Completions</h2>
                        <div className="list-group">{allVideo}</div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Complete;
