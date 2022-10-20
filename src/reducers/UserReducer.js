import UserActions from "../actions/UserActions";
import UserObject from "../utilities/userStorage";

const UserReducer = (state,action) =>{
    switch(action.type){
        case UserActions.GET_USER_INFO_BY_HASH:
            console.log(action.value,state);
            if(action.value === '123456789'){
                UserObject.setUserInformation({id:123,name:'jahid',role:'user'})
                return UserObject.isAuthenticate();
            }
            return UserObject.isAuthenticate();
        case UserActions.GET_USER_INFO_BY_ID:
            break;
        case UserActions.AUTH_USER_BY_EMAIL_PASSWORD:
            if(action.value.email === 'jahidsagar@gmail.com' && action.value.password === '1234567'){
                UserObject.setUserInformation({id:123,name:'jahid',role:'user'})
                return UserObject.isAuthenticate();
            }
            return UserObject.isAuthenticate();
        default:
            return state;
    }
}
export default UserReducer;