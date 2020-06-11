let instance = null;

class GlobalEvent {
    constructor() {
        this.events = {};
    }

    addEventListener(eventName, callback){
        if(!this.events[eventName]){
            this.events[eventName] = [];
        }
        let index = this.events[eventName].indexOf(callback);
        // this callback is added ready to events queue
        if(index !== -1) return false;
        this.events[eventName].push(callback);
        return true;
    }

    removeEventListener(eventName, callback){
        // there's no eventName so simple is return, no thing to do here
        if(!this.events[eventName] || !this.events[eventName].length) return false;
        // check if this callback is in this events
        let index = this.events[eventName].indexOf(callback);
        // this callback is not in this event so we simple return, nothing todo
        if(index === -1) return;
        // remove this callback to event queue
        this.events[eventName].splice(index, 1);
        return true;
    }

    fireEvent(eventName, data){
        // there's no eventName so simple is return, no thing to do here
        if(!this.events[eventName] || !this.events[eventName].length) return false;
        this.events[eventName].forEach(c => {
            if(c){
                c(data);
            }
        });
    }

    static getInstance() {
        if (instance) return instance;
        instance = new GlobalEvent();
        return instance;
    }
}

let globalEvent = GlobalEvent.getInstance();
export default globalEvent;