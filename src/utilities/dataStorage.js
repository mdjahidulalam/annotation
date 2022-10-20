// singletone class
let instance;
class Data {
    constructor() {
        if (!instance) this.instance = this;
        return instance;
    }
    storeData = (key,value) => window.localStorage.setItem(key, JSON.stringify(value));
    getData = key => JSON.parse(window.localStorage.getItem(key));
    removeData = key => window.localStorage.removeItem(key);
    isDataExist = key => window.localStorage.getItem(key) ? true : false;
    print = key => console.log(this.getData());
}
let DataObject = Object.freeze(new Data());

export default DataObject;