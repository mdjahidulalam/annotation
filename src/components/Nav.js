import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UserObject from "../utilities/userStorage";

const Nav = () => {
    let navigate = useNavigate();
    const { pathname } = useLocation();
    const [IsLoggedIn, setIsLoggedIn] = useState(false);
    
    useEffect(()=>{
        setIsLoggedIn(UserObject.isAuthenticate());
    },[]);
    const logoutHandler = () => {
        UserObject.removeUserInformation();
        setIsLoggedIn(UserObject.isAuthenticate());
        navigate('/')
    }
    return (
        <nav className="navbar navbar-expand-lg sticky-top navbar-light bg-light">
            <div class="container-fluid">
                <Link className="navbar-brand fw-bold" to="/">Annotation</Link>
                
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
                    {
                        IsLoggedIn ?
                            <>
                                <ul class="navbar-nav">
                                    <li class="nav-item">
                                        <Link class="nav-link" to="/videos">Videos</Link>
                                    </li>
                                    <li class="nav-item">
                                        <Link class="nav-link" to="/category">Category</Link>
                                    </li>
                                    <li class="nav-item">
                                        <Link class="nav-link" to="/complete">Complete</Link>
                                    </li>
                                    <li class="nav-item">
                                        <button onClick={logoutHandler} className="btn btn-link auth-btn">Log out</button> 
                                    </li>
                                </ul>
                            </>:
                            pathname === '/signin' ?
                                <button className="btn btn-outline-primary auth-btn"><Link to="/signup">Sign-up</Link></button> : pathname === '/signup' ?
                                <button className="btn btn-outline-primary mr-1 auth-btn"><Link to="/signin">Sign-in</Link></button> :
                                <>
                                    <button className="btn btn-outline-primary auth-btn"><Link to="/signup">Sign-up</Link></button>
                                    <button className="btn btn-outline-primary mr-1 auth-btn"><Link to="/signin">Sign-in</Link></button>
                                </>
                    }
                </div>
            </div>
        </nav>
    );
}
export default Nav;