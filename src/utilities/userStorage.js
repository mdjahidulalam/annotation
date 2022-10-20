// singletone class
let instance;
class User {
    constructor() {
        if (!instance) this.instance = this;
        return instance;
    }
    setUserInformation = (value) => window.localStorage.setItem('user', JSON.stringify(value));
    getUserInformation = () => JSON.parse(window.localStorage.getItem('user'));
    removeUserInformation = () => window.localStorage.removeItem('user');
    isAuthenticate = () => window.localStorage.getItem('user') ? true : false;
    print = ()=> console.log(this.getUserInformation());
}
let UserObject = Object.freeze(new User());

export default UserObject;