import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Hash from "./components/Hash";
import Welcome from "./components/Welcome";
import Category from "./pages/Category";
import Complete from "./pages/Complete";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VideoAnnotation from "./pages/VideoAnnotation";
import Videos from "./pages/Videos";
import UserObject from "./utilities/userStorage";

const Main = () => {
    // eslint-disable-next-line
    const [IsLoggedIn, setIsLoggedIn] = useState(UserObject.isAuthenticate());
    let location = useLocation();
    useEffect(()=>{
        setIsLoggedIn(UserObject.isAuthenticate())
    },[location])
    return (
        <>
            {/* <Nav /> */}
            <Routes>
                {!IsLoggedIn &&
                    <>
                        <Route path="/signin" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                    </>
                }
                {IsLoggedIn &&
                    <>
                        <Route path="/videos" element={<Videos />} />
                        <Route path="/videos/:url"  element={<VideoAnnotation />} />
                        <Route path="/complete"  element={<Complete />} />
                        <Route path="/category"  element={<Category />} />
                    </>
                }
                <Route path="/auth/:hash" element={<Hash />} />
                <Route path="/" exact element={<Welcome />} />
                <Route path="/*" element={<Welcome />} />
            </Routes>
        </>

    )
}
export default Main;