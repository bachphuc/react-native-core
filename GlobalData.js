let instance = null;

class GlobalData {
    data = {};

    constructor() {

    }

    set(key, value) {
        this.data[key] = value;
    }

    has(key) {
        return this.data[key] ? true : false;
    }

    get(key) {
        if (this.has(key)) {
            return this.data[key];
        }
        return null;
    }

    static getInstance() {
        if (instance) return instance;
        instance = new GlobalData();
        return instance;
    }
}

let globalData = GlobalData.getInstance();
export default globalData;