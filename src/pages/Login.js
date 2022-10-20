import { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserActions from "../actions/UserActions";
import Nav from "../components/Nav";
import UserReducer from "../reducers/UserReducer";



const Login = () => {
    const [isAuth, dispatch] = useReducer(UserReducer, false);
    const [Form, setForm] = useState();
    const formHandler = (event) => {
        event.preventDefault();
        console.log(Form);
        dispatch({ type: UserActions.AUTH_USER_BY_EMAIL_PASSWORD, value: Form });
        console.log('isauth', isAuth);
    }
    let navigate = useNavigate();
    useEffect(() => {
        // debugger;
        isAuth ? navigate('/') : navigate('/signin');
    }, [isAuth,navigate])

    const changeHandler = (e) => {
        const { name, value } = e.target;
        setForm({
            ...Form,
            [name]: value,
        })
    }
    return (
        <>
            {/* {isAuth? navigate('/'):navigate('/signin')} */}
            <Nav />
            <div className="authentication">
                <form className="mx-auto login my-3">
                    <div className="form-group">
                        <label htmlFor="exampleInputEmail1">Email address</label>
                        <input type="email" onChange={changeHandler} name="email" className="form-control" id="email" placeholder="Enter email" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="exampleInputPassword1">Password</label>
                        <input type="password" onChange={changeHandler} name="password" className="form-control" id="password" placeholder="Enter password" />
                    </div>
                    {/* <div className="form-group form-check">
                        <input type="checkbox" className="form-check-input" id="exampleCheck1" />
                        <label className="form-check-label" htmlFor="exampleCheck1">Remember me</label>
                    </div> */}
                    <button type="submit" onClick={formHandler} className="btn btn-primary">Sign-in</button>
                </form>
            </div>
        </>
    )
}
export default Login;