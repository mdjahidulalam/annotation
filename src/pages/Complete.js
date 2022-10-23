import React, { useEffect, useReducer, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../components/Nav";
import axios from "axios";
import { AppConfig } from "../config/AppConfig";

const BASE_API_URL = AppConfig.baseApiURL;

const Complete = () => {
    const [GetVideos, setGetVideos] = useState([]);

    useEffect(() => {
        axios
            .get(`${BASE_API_URL}/complete`)
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

    const allVideo = GetVideos.map((v, index) => {
        const temp = JSON.parse(v.json);
        return (
            <Link
                title="click to watch/annotate same video"
                to={"/videos/" + temp.VideoId}
                className="list-group-item list-group-item-action flex-column align-items-start "
                key={index}
            >
                <div className="d-flex w-100 justify-content-between">
                    <h2 className="fs-6 fw-bold my-2">{temp.video}</h2>
                    <small>{v.timestamp}</small>
                </div>
                <p className="mb-0">{temp.signText}</p>
                <p className="mb-1">{temp.naturalText}</p>
            </Link>
        );
    });
    return (
        <>
            <Nav />
            <div className="container py-3">
                <div className="row">
                    <div className="col-md-12 mx-auto">
                        <h1 className="my-2 fs-5">All Completions</h1>
                        <div className="list-group">{allVideo}</div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Complete;
