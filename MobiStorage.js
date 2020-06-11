const Realm = require('realm');

import {Log} from './Utils';
import modelSchema from 'app/Models/ModelSchema';
import Config from 'app/Config';
import AsyncStorage from '@react-native-community/async-storage';


const STORAGE_MODEL_NAME = 'Storage';
const CHAT_USER_MODEL_NAME = 'ChatUser';
const CHAT_MESSAGE_MODEL_NAME = 'ChatMessage';

var schemaIndex = {};

modelSchema.schema.forEach(s => {
    schemaIndex[s.name] = s;
});

export const GRealm = new Realm(modelSchema);

class ResultObject{
    constructor(content = null){
        this.setContent(content);
    }

    setContent(content = null){
        this.content = content;
    }

    getContent(){
        return this.content;
    }

    get value(){
        return this.getContent();
    }

    toJSON(){
        if(!this.content) return null;
        try{
            let item = JSON.parse(this.content);
            return item;
        }
        catch(e){
            Log('toJSON error');
            Log(e);
            return null;
        }
    }

    toString(){
        return this.content;
    }
}

class ChatStorage{

    constructor(){
        this.realm = GRealm;
    }

    saveUser(user){
        // check if user is exists
        let item = this
        .realm
        .objectForPrimaryKey(CHAT_USER_MODEL_NAME, user.id);

        this.realm.write(() => {
            if(!item){
                this.realm.create(CHAT_USER_MODEL_NAME, {
                    id : user.id,
                    full_name : user.full_name,
                    profile_image : user.profile_image || '',
                    channel_id : user.channel_id || ''
                });
            }
            else{
                // update object here
                item.full_name = user.full_name;
                item.profile_image = user.profile_image;
                if(user.channel_id){
                    item.channel_id = user.channel_id;
                }
            }
        });
    }

    saveUsers(users){
        if(!users || !users.length) return;
        this.realm.write(() => {
            users.forEach(user => {
                let item = this.realm.objectForPrimaryKey(CHAT_USER_MODEL_NAME, user.id);
                if(!item){
                    this.realm.create(CHAT_USER_MODEL_NAME, {
                        id : user.id,
                        full_name : user.full_name,
                        profile_image : user.profile_image || '',
                        channel_id : user.channel_id || ''
                    });
                }
                else{
                    // update object here
                    item.full_name = user.full_name;
                    item.profile_image = user.profile_image;
                    if(user.channel_id){
                        item.channel_id = user.channel_id;
                    }
                }
            });
        });
    }

    getUsers(){

    }

    removeUser(user){

    }

    saveMessage(message){

    }

    getMessages(user){

    }
}

class MobiStorageService {
    realm = null;
    constructor() {
        this.init();
    }

    init() {
        if (this.realm) 
            return;
        this.realm = GRealm;
    }

    getRealm(){
        return this.realm;
    }

    setItem(key, value = '') {
        if(Config.STORAGE_LIBRARY === 'AsyncStorage'){
            let data = typeof value === 'string' ? value : JSON.stringify(value);
            return AsyncStorage.setItem(key, data);
        }
        if (!this.realm) 
            return null;
        if (!key) 
            return null;
        
        let data = typeof value === 'string' ? value : JSON.stringify(value);
        // how to query from realm object let items =
        // this.realm.objects(STORAGE_MODEL_NAME).filtered(`key == "${key}"`);
        let item = this
            .realm
            .objectForPrimaryKey(STORAGE_MODEL_NAME, key);

        try {
            this.realm.write(() => {
                // update data if this item is exists or create new
                if (item) {
                    Log(`item key: ${item.key}`);
                    item.value = data;
                    item.modified_at = new Date();
                    Log(`setItem update ${key} successfully`);
                    Log(item);
                } else {
                    this.realm.create(STORAGE_MODEL_NAME, {
                        key : key,
                        value : data,
                        modified_at : new Date()
                    });
                    Log(`setItem create ${key} successfully`);
                }
            });
        } catch (e) {
            Log("Error on creation");
            Log(e);
        }
    }

    getItem(key, defaultValue = undefined) {
        if(Config.STORAGE_LIBRARY === 'AsyncStorage'){
            return new Promise((resolve, reject) => {
                AsyncStorage.getItem(key).then((value) => {
                    let result = new ResultObject(value !== null && value !== undefined ? value : defaultValue);
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                });
            });
        }
        let item = this
            .realm
            .objectForPrimaryKey(STORAGE_MODEL_NAME, key);
        Log(item);
        if(!item) return new ResultObject(defaultValue ? JSON.stringify(defaultValue) : null);
        let resultObject = new ResultObject(item.value);

        return resultObject;
    }

    removeItem(key){
        if(!key) return;

        AsyncStorage.removeItem(key);
    }

    multiGet(keys){
        if(!keys || !keys.length) return null;
        let result = {};
        keys.forEach(k => {
            let item = this
            .realm
            .objectForPrimaryKey(STORAGE_MODEL_NAME, k);
            if(item){
                result[k] = item.value;
            }
        });

        return result;
    }

    getSchema(name){
        if(schemaIndex[name]){
            return schemaIndex[name];
        }

        return null;
    }
}

const MobiStorage = new MobiStorageService();

export default MobiStorage;