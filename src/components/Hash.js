import { useEffect, useReducer } from "react";
import { Navigate,useNavigate, useParams } from "react-router-dom";
import UserActions from "../actions/UserActions";
import UserReducer from "../reducers/UserReducer";

const Hash = () => {
    let navigate = useNavigate();
    const { hash } = useParams();
    const [UserInfo, dispatch] = useReducer(UserReducer, false)

    useEffect(()=>{
        dispatch({
            type:UserActions.GET_USER_INFO_BY_HASH,
            value:hash
        });
    },[hash]);
    
    return (
        <>
            {UserInfo?navigate('/'):navigate('/signin')}
            {/* {UserInfo?<Navigate to='/' /> : <Navigate to='/signin' />} */}
        </>
    )
}
export default Hash;