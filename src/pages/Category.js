import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import axios from "axios";

function Category() {
    const [Form, setForm] = useState({ annotation: '', meta: '' });
    const [CategoryId, setCategoryId] = useState([]);
    const [Data, setData] = useState();
    const [CategoryName, setCategoryName] = useState();

    const formHandler = (e) => {
        const { name, value } = e.target;
        setForm({
            ...Form,
            [name]: value,
        })
    }
    const searchHandler = () => {
        axios.post('http://192.168.1.34:4000/search', Form)
            .then(res => {
                const data = res.data.map(v => {
                    v.json = JSON.parse(v.json)
                    return v;
                })

                let allGlossAnnotation = [];
                let c = 1;
                data.map(v => {
                    const id = v.id;
                    const timeStamp = v.timestamp;
                    const extractAnnotation = [...v.json.annotation];
                    const extractMeta = [...v.json.meta];
                    const signText = v.json.signText;
                    const naturalText = v.json.naturalText;
                    const videoLink = v.json.video;
                    return extractAnnotation.forEach(value => {
                        const returnValue = {
                            id: c++,
                            dbRowId: id,
                            timeStamp,
                            signText,
                            naturalText,
                            videoLink,
                            word: value.word,
                            startIndex: value.tsi,
                            endIndex: value.tse,
                            videoStart: value.vst,
                            videoEnd: value.vet,
                            extractMeta
                        }
                        if (Form.annotation.length > 0) {
                            if (Form.annotation === returnValue.word) allGlossAnnotation.push(returnValue);
                        }
                        else allGlossAnnotation.push(returnValue);
                    })

                })
                setData(allGlossAnnotation);
            })
            .catch(err => {
                console.log(err);
            });
    }

    useEffect(() => {
        console.log('CategoryId ', CategoryId);
    }, [CategoryId])

    const categoryHandler = (e) => {
        setCategoryName(e.target.value)
    }

    const setChecked = (val) => {
        if (CategoryId.includes(val)) setCategoryId(CategoryId.filter(v => v !== val));
        else setCategoryId([...CategoryId, val]);
    }

    const createGroupHandler = () => {
        const allData = [];
        Data.forEach(v=> CategoryId.includes(v.id)? allData.push(v):allData);
        const submittedData = {
            CategoryName,
            allData
        };
        console.log(submittedData);
        axios.post('http://192.168.1.34:4000/category',submittedData)
            .then(res=>{
                console.log(res.data);
            })
            .catch(err=>{
                console.log(err);
            })
    }
    const renderData = Data ? Data.map(v => {
        return (
            <div
                key={v.id}
                className="list-group-item list-group-item-action flex-column align-items-start "
            >
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        defaultChecked={CategoryId.includes(v.id)}
                        id="flexCheckChecked"
                        onChange={() => setChecked(v.id)} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                    {CategoryId.includes(v.id)?"Click to remove from Category":"Click to add to Category"}
                        
                    </label>
                </div>

                <div className="d-flex w-100 justify-content-between">
                    <h5 className="mb-1">{v.videoLink}</h5>
                    <small>{v.timestamp}</small>
                </div>
                <p className="mb-1">Gloss: {v.word}, Start at: {v.videoStart}, End at: {v.videoEnd}</p>
                <p className="mb-1">{v.signText}</p>
                <small>{v.naturalText}</small>
            </div>
        )
    }) : null;
    return (
        <>
            <Nav />
            <div className="container">
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="exampleInputEmail1">Gloss</label>
                            <input
                                type="text"
                                onChange={formHandler}
                                name="annotation"
                                className="form-control"
                                id="meta"
                                placeholder="gloss search"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleInputPassword1">Meta</label>
                            <input
                                type="text"
                                onChange={formHandler}
                                name="meta"
                                className="form-control"
                                id="meta"
                                placeholder="meta search"
                            />
                        </div>
                        <button className="btn btn-success" onClick={searchHandler}>Search</button>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="exampleInputPassword1">Add category</label>
                            <input
                                type="text"
                                onChange={categoryHandler}
                                name="category"
                                className="form-control"
                                id="category"
                                placeholder="Add category"
                                value={CategoryName}
                            />
                        </div>
                        {CategoryName && CategoryId.length > 0 &&
                            <button className="btn btn-success" onClick={createGroupHandler}>Create category</button>
                        }
                    </div>
                </div>
                {renderData ? renderData : null}
            </div>
        </>
    );
}

export default Category;
