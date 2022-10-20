import Nav from "../components/Nav";

const Signup = () => {
    return (
        <>
            <Nav />
            <div className="authentication">
                <form className="mx-auto login">
                    <div className="form-group">
                        <label for="exampleInputEmail1">Email address</label>
                        <input type="email" className="form-control" id="exampleInputEmail1"
                            aria-describedby="emailHelp" />
                    </div>
                    <div className="form-group">
                        <label for="exampleInputPassword1">Password</label>
                        <input type="password" className="form-control" id="exampleInputPassword1" />
                    </div>
                    <div className="form-group">
                        <label for="exampleInputPassword1">Confirm password</label>
                        <input type="password" className="form-control" id="exampleInputPassword1" />
                    </div>
                    <div className="form-group form-check">
                        <input type="checkbox" className="form-check-input" id="exampleCheck1" />
                        <label className="form-check-label" for="exampleCheck1">I agree on Terms & conditions</label>
                    </div>
                    <button type="submit" className="btn btn-primary">Registration</button>
                </form>
            </div>
        </>
    )
}
export default Signup;