import io from 'socket.io-client';
import {AsyncStorage, Platform} from 'react-native';

import {Log, Warn, Utils} from './../Utils';
import Config from 'app/Config';
import Api from './../Api';

import MobiStorage from './../MobiStorage';
import AppConfig from 'app/Config';
import ChatUser from 'app/Models/ChatUser';
import ChatMessage from 'app/Models/ChatMessage';
import Emoticon from 'app/Models/Emoticon';

const ACCESS_TOKEN = Config.MOBI_ACCESS_TOKEN;
const SOCKET_URL = Config.SOCKET_URL;

const DEFAULT_USER_IMAGE = 'https://cdn4.iconfinder.com/data/icons/reaction/32/joy-512.png';

export const AUTHENTICATION_TOKEN_KEY = 'socket_authentication-token';
export const AUTHENTICATION_USER_KEY = 'socket_authentication-user';
export const AUTHENTICATION_USER_AUTH = 'socket_authentication-auth';
export const EMOTICON_STORAGE_KEY = 'emoticon_storage_key';
import lang from './../lang';

const Storage = AppConfig.storage_adapter === 'AsyncStorage'
    ? AsyncStorage
    : MobiStorage;

function SLog(data) {
    if(typeof data === 'string'){
        Log(`MobiSocket > ${data}`);
        return;
    }
    Log(data);
}

const SOCKET_SENDING_TIMEOUT = 20000;

class MobiSocketService {
    socket = null;
    user = null;
    token = null;
    users = [];
    userIndexes = {};
    initialized = false;
    currentTarget = null;
    networkState = null;
    emoticons = null;
    emoticonPackages = null;
    customEvents = {};

    cacheMessages = {};

    timers = {};

    callbacks = {};
    constructor(props) {
        this.deviceToken = null;
    }

    setNetworkState(state) {
        this.networkState = state;
    }

    getNetworkState() {
        return this.networkState;
    }

    getSocket() {
        return this.socket;
    }

    reconnect() {
        this.socket = io(SOCKET_URL);
    }

    setCallBack(type, c) {
        if (!this.callbacks[type]) {
            this.callbacks[type] = [];
        }
        // check if callback is function
        if (typeof c !== 'function') 
            return;
        
        // callback is exists return
        if (this.callbacks[type].indexOf(c) != -1) 
            return;
        this
            .callbacks[type]
            .push(c);
        SLog(`setCallBack > ${type} total ${this.callbacks[type].length}`);
    }

    addEventListener(type, c){
        return this.setCallBack(type, c);
    }

    fireCallBack(type, data) {
        if (!this.callbacks[type]) 
            return;
        this
            .callbacks[type]
            .forEach(c => {
                if (typeof(c) === 'function') {
                    c(data);
                }
            });
    }

    deleteCallback(type, c) {
        if (!this.callbacks[type]) 
            return;
        let index = this
            .callbacks[type]
            .indexOf(c);
        if (index == -1) 
            return;
        this
            .callbacks[type]
            .splice(index, 1);
        SLog(`deleteCallback > ${type} total ${this.callbacks[type].length}`);
    }

    removeCallback(type, c) {
        this.deleteCallback(type, c);
    }

    removeEventListener(type, c){
        this.deleteCallback(type, c);
    }

    setCurrentTarge(u) {
        if (u) {
            // reset total_unread if user go to chat with this user
            u.total_unread = 0;
            // update last_updated time for this user
            Log('ChatMainScreen > setCurrentTarge > update user ' + u.id);
            u.last_updated = new Date();
            ChatUser.save({
                id : u.id,
                last_updated : new Date()
            });

            this.sortUserList();
            
        }

        this.currentTarget = u;
    }

    isInChat() {
        return this.currentTarget
            ? true
            : false;
    }

    getCurrentTarget(){
        return this.currentTarget;
    }

    init() {
        if (this.socket) 
            return this.socket;
        this.socket = io(SOCKET_URL);
        this.initListener();
        this.initialized = true;
    }

    handlerLogin(data) {
        SLog('handlerLogin');
        this.isAuthenticating = false;
        // SLog(data);
        if (data.status) {
            // storage token and user here data.token, data.user
            this.token = data.token;
            this.user = data.user;

            this.saveAuthentication();

            // end storage token and user
            this
                .socket
                .removeAllListeners(this.user.user_public_key);
            // init listener for this user
            this
                .socket
                .on(this.user.user_public_key, (data) => this.receiveHandler(data));

            this.getListUsers();

            this.fireCallBack('socketReady', this.user);
        } else {
            if (data.error_code == 'USER_NOT_EXISTS') {
                // should clear data here because authentication failed
                this.token = null;
                this.user = null;
            }
            if (data.message || data.error) {
                // should process error here
            }
        }

        this.fireCallBack('login', data);
    }

    getListUsers() {
        if (!this.user) 
            return;
        this
            .socket
            .emit('users');
    }

    handlerLogout(data) {
        SLog(data);
    }

    receiveHandler(data) {
        SLog('receiveHandler');

        if (!data || !data.type) 
            return;
        var handleString = Utils.convertFunctionName(data.type + 'Handler');
        if (this[handleString] && typeof this[handleString] === 'function') {
            this[handleString](data);
        } else {
            SLog(handleString + " wasn't registered.");
        }

        var callbackName = Utils.convertFunctionName(data.type);
        this.fireCallBack(callbackName, data);

        if(data.client_id_key){
            this.fireCallBack(data.client_id_key, data);
        }
    }

    handlerError(data) {
        SLog('handlerError');
        SLog(data);
        if (data.error_code == 'AUTHENTICATION_ERROR') {
            if (this.token) {
                this.authenticate();
            }
        }
    }

    authenticate() {
        if (!this.token) 
            return;
        // only allow a authenticate process once
        if(this.isAuthenticating) return;
        this.isAuthenticating = true;
        SLog('authenticate > again');
        this
            .socket
            .emit('authenticate', {
                authentication_token: this.token,
                access_token: ACCESS_TOKEN
            });
    }

    initListener() {
        this
            .socket
            .on('register', (data) => this.handlerLogin(data));

        this
            .socket
            .on('login', (data) => this.handlerLogin(data));

        this
            .socket
            .on('disconnect', (data) => this.handlerLogout(data));

        this
            .socket
            .on('ping', function (data) {
            });

        this
            .socket
            .on('new-user', (data) => this.receiveHandler(data));
        this
            .socket
            .on('user_online', (data) => this.receiveHandler(data));
        this
            .socket
            .on('user_offline', (data) => this.receiveHandler(data));

        this
            .socket
            .on('errors', (data) => this.handlerError(data));
    }

    moveUserToTop(user){
        if (!this.users || !this.users.length) return;
        let index = this.users.indexOf(user);
        if(index > 0){
            // first remove this item from array
            // add this item to frist position
            this.users.splice(index, 1);
            this.users.splice(0, 0, user);
        }
    }

    sortUserList(fireEvent = true) {
        if (!this.users || !this.users.length) 
            return;
        
        Log('sortUserList');

        this.users.sort((u1, u2) => {
            if (u1.is_online && !u2.is_online) 
                return -1;
                
            if(!u1.is_online && u2.is_online)
                return 1;
            
            if(new Date(u1.last_updated) - new Date(u2.last_updated) > 0)
                return -1;
            
            return 1;
        });

        if(fireEvent){
            setTimeout(() => {
                this.fireCallBack('userListChanged');
            }, 500);
        }

        return this;
    }

    userOnlineHandler(data) {
        if (!this.user) 
            return;
        if (data.status) {
            let item = data.user;
            // item.last_updated = new Date();
            // this me don't add to need, return
            if (this.user.id == item.id) 
                return;
            
            if (this.userIndexes[item.id]) {
                this.userIndexes[item.id].is_online = true;
                // this.userIndexes[item.id].last_updated = new Date();
            } else {
                item.is_online = true;
                // save this user
                item.last_updated = new Date();
                ChatUser.save(item);

                this.users.push(item);
                this.userIndexes[item.id] = item;
            }

            this.sortUserList();
        }
    }

    userOfflineHandler(data) {
        if (data.status) {
            let item = data.user;
            if (this.userIndexes[item.id]) {
                this.userIndexes[item.id].is_online = false;
                this.sortUserList();
            }
        }
    }

    getUserList() {
        return this.users;
    }

    usersListHandler(data) {
        if (data.status && data.users && data.users.length) {
            data
                .users
                .forEach(e => {
                    if (this.userIndexes[e.id]) {
                        if (e.is_online !== undefined) {
                            this.userIndexes[e.id].is_online = e.is_online;
                        }
                        if (e.profile_image) {
                            this.userIndexes[e.id].profile_image = e.profile_image;
                        }
                    } else {
                        if (!e.last_updated) {
                            if(e.updated_at){
                                e.last_updated = new Date(e.updated_at);
                            }
                            else{
                                e.last_updated = new Date();
                            }
                        }

                        this
                            .users
                            .push(e);
                        this.userIndexes[e.id] = e;
                    }
                });

                // save users by use realm
                ChatUser.saveList(data.users);

            this.sortUserList();
        }
    }

    SLog(data) {
        SLog(data);
    }

    newMessagesHandler(data) {
        SLog('newMessagesHandler');
        if (data.status) {
            if (this.user.id == data.chat.user_id) {
                // this's my message
                if(this.currentTarget){
                    let chat = data.chat;
                    chat.target_user_id = this.currentTarget.id;
                    ChatMessage.save(chat);
                }
                return;
            }
                
            let chat = data.chat;

            // find this user
            if (!this.userIndexes[chat.user_id]) 
                return;
            var item = this.userIndexes[chat.user_id];
            item.last_updated = new Date();
            // update last_updated time for this user
            ChatUser.save({
                id : item.id,
                last_updated : item.last_updated,
                last_message : chat.message || undefined
            });
            chat.target_user_id = chat.user_id;
            ChatMessage.save(chat);

            if (chat.message) {
                SLog('newMessagesHandler > last_message > ' + chat.message);
                item.last_message = chat.message;
                // need move to top
                this.moveUserToTop(item);
            }

            if (!this.isInChat() || (this.isInChat() && this.currentTarget.id != chat.user_id)) {
                // update number of total unread for this user
                if (item.total_unread === undefined) {
                    item.total_unread = 0;
                }
                item.total_unread++;
                SLog('newMessagesHandler > total_unread > ' + item.total_unread);

                // emit received this message
                this.makeAsReceivedMessage(chat.user_id, chat);
            }
        }
    }

    shareToUsers(users, data){
        let item = data.item;
        if(data.type == 'music'){
            let params = {
                music : item,
                message_type : 'link',
                link_type : 'music',
                link : item.info,
                link_description : item.creator,
                link_title : item.title,
                link_image : item.bgimage || item.avatar || item.coverimage,
                message : lang('send_you_a_song'),
                skip_process : true
            };
            users.forEach(u => {
                this.onSendMessage(u, params);
            });
        }
    }

    onSendMessage(targetUser, params) {
        if (!targetUser) 
            return;
        let data = {
            user_id: targetUser.id,
            message: params.message,
            message_type: params.message_type || 'text',
            client_key: Utils.createUniqueString(16)
        };

        let message = {
            client_key: data.client_key,
            message: data.message,
            message_type: data.message_type,
            username: this.user.full_name,
            user_name: this.user.full_name,
            created_at: (new Date).toJSON(),
            user_id: this.user.id,
            target_user_id : targetUser.id,
            message_status : 'sending'
        };

        if(params.message_type == 'image'){
            if(params.image_width){
                data.image_width = params.image_width;
            }
    
            if(params.image_height){
                data.image_height = params.image_height;
            }
    
            if(params.image_ratio){
                data.image_ratio = params.image_ratio;
            }
        }
        else if(params.message_type == 'animate_emoticon'){
            message.emoticon_autoplay = true;
            if(params.emoticon){
                for(let k in params.emoticon){
                    data['emoticon_' + k] = params.emoticon[k];
                    message['emoticon_' + k] = params.emoticon[k];
                }
            }
            else{
                return;
            }
        }
        else if(params.message_type == 'link'){
            if(params.link){
                data.link = params.link;
                message.link = params.link;
            }
            if(params.link_title){
                data.link_title = params.link_title;
                message.link_title = params.link_title;
            }
            if(params.link_description){
                data.link_description = params.link_description;
                message.link_description = params.link_description;
            }
            if(params.link_image){
                data.link_image = params.link_image;
                message.link_image = params.link_image;
            }
            if(params.link_host){
                data.link_host = params.link_host;
                message.link_host = params.link_host;
            }
            if(params.embed){
                data.embed = params.embed;
                message.embed = params.embed;
            }
            if(params.link_type){
                data.link_type = params.link_type;
                message.link_type = params.link_type;
            }
            if(params.music){
                data.music = params.music;
                message.music = params.music;
            }
        }

        if(params.skip_process !== undefined){
            data.skip_process = true;
        }
        // should handle like play sound or do something end play handle play sound
        SLog('emit message to: ' + targetUser.id);
        this
            .socket
            .emit('messages/to', data);

        if(params.message){
            targetUser.last_message = params.message;
        }
        targetUser.last_updated = new Date();
        // save this message
        ChatMessage.save(message);

        // update last_updated time for this user
        ChatUser.save({
            id : targetUser.id,
            last_updated : new Date(),
            last_message : message.message || undefined
        });

        return message;
    }

    makeAsReceivedMessage(targetUser, message){
        if (!targetUser || !message) 
        return;
        let tmp = {
            message_status : 'received',
            user_id : message.user_id,
            message_type : message.message_type
        };
        if(message.id){
            tmp.id = message.id;
        }
        if(message.client_key){
            tmp.client_key = message.client_key;
        }
        this.onUpdateMessage(targetUser, tmp);
    }

    makeAsReadMessage(targetUser, message){
        if (!targetUser || !message) 
        return;
        SLog('makeAsReadMessage');
        let tmp = {
            message_status : 'read',
            user_id : message.user_id,
            message_type : message.message_type
        };
        if(message.id){
            tmp.id = message.id;
        }
        if(message.client_key){
            tmp.client_key = message.client_key;
        }
        this.onUpdateMessage(targetUser, tmp);
    }

    onUpdateMessage(targetUser, message) {
        if (!targetUser || !message) 
            return;

        // update this message to local
        ChatMessage.save(message);

        let data = {
            user_id: typeof targetUser === 'object' ? targetUser.id : targetUser,
            message: JSON.stringify(message)
        };
        // should handle like play sound or do something end play handle play sound
        this
            .socket
            .emit('messages/update', data);
    }

    getUser() {
        return this.user;
    }

    getUserTitle() {
        return this.user
            ? this.user.full_name
            : '';
    }

    getUserImage(u) {
        let item = u
            ? u
            : this.user;
        if (!item) 
            return DEFAULT_USER_IMAGE;
        
        return item.profile_image
            ? this.getImage(item.profile_image)
            : DEFAULT_USER_IMAGE;
    }

    isOwner(message) {
        if (!this.user) 
            return false;
        return this.user.id == message.user_id
            ? true
            : false;
    }

    getListMessage(targetUser, messages = [], reverse = false) {
        let params = {
            user_id: targetUser.id
        };
        if (messages.length) {
            if (!reverse) {
                params['max_time'] = messages[messages.length - 1].created_at;
            } else {
                params['max_time'] = messages[0].created_at;
            }
        }
        SLog(params);
        this
            .socket
            .emit('messages/from', params);
    }

    getMessageUserImage(user) {
        return user.profile_image
            ? this.getImage(user.profile_image)
            : '';
    }

    isUser() {
        return this.user
            ? true
            : false;
    }

    setToken(token) {
        this.token = token;
    }

    getToken(){
        return this.token;
    }

    setUser(user) {
        this.user = user;
    }

    setAuthenticationData(data) {
        if(!data) return;
        if (data.token) {
            this.setToken(data.token);
        }
        if (data.user) {
            let user = typeof data.user === 'string' ? JSON.parse(data.user) : data.user;
            this.setUser(user);
        }
    }

    initSocket(){
        this.init();
        if(this.token){
            this.authenticate();
        }
        else{
            this.initAuthentication().then((user) => {

            })
            .catch((err) => {
                Log(`initSocket initAuthentication > failed`);
            });
        }
    }

    initAuthentication() {
        Log(`Socket initAuthentication`)
        return new Promise((resolve, reject) => {
            if (this.user) {
                Log(`Socket initAuthentication has user`)
                resolve(this.user);
                return;
            }
            Log(`Socket initAuthentication begin get setting`)
            MobiStorage.getItem(AUTHENTICATION_USER_AUTH).then((result) => {
                Log(`Socket initAuthentication begin setting done, result: ${result ? result.value: 'null'}`)
                if(result){
                    let auth = result.toJSON();
                    Log(`Socket initAuthentication begin setting done, auth: ${auth ? 'ok': 'null'}`)
                    if(auth){
                        Log(auth);
                        let isUser = this.isUser();
                        this.setAuthenticationData(auth);
                        if (this.isUser()) {
                            if (!isUser) {
                                this.authenticate();
                            }
                            // trigger command to get list user here
                            if (!this.isGotUserLocal) {
                                this.getLocalUserList();
                            }
                            Log(`Socket initAuthentication > success`)
                            resolve(auth.user);
                            return;
                        }
                    }
                }
                Log(`Socket initAuthentication No authentication found.`)
                reject({error: 'Socket No authentication found.'});
            })
            .catch(err => {
                Log(`Socket initAuthentication error`)
                reject(err);
            })
        });
    }

    saveAuthentication() {
        if (!this.token || !this.user) 
            return false;

        MobiStorage.setItem(AUTHENTICATION_USER_AUTH, {
            token: this.token,
            user: this.user
        })
    }

    getUserKey(type) {
        if (!this.token) 
            return null;
        return this.token + '_' + type;
    }

    saveUserList() {

    }

    async getLocalUserList() {
        if (!this.user) 
            return;
        this.isGotUserLocal = true;
        try {
            let users = ChatUser.get();
            // turn of this log, it's very noisy
            // Log(users);
            if (users && users.length) {
                Log('MobiSocket > getLocalUserList > success > total: ' + users.length);
                users.forEach(e => {
                    if (this.user.id != e.id) {
                        if (this.userIndexes[e.id]) {
                            this.userIndexes[e.id].is_online = false;
                        } else {
                            e.is_online = false;
                            this
                                .users
                                .push(e);
                            this.userIndexes[e.id] = e;
                        }
                    }
                });
            }
            if (this.users.length) {
                this.fireCallBack('getLocalUsersList');
            }

        } catch (error) {
            SLog('getLocalUserList > error');
            Log(error);
        }
    }

    getMessagesFromLocal(targetUser) {
        if (!this.user || !targetUser) 
            return;

        let messages = ChatMessage.getOf(targetUser);
        return messages;
    }

    saveMessage(targetUser, messages = [], reverse = false) {
        SLog('saveMessage > messages > before > ' + messages.length);
        let lastTime = messages.length
            ? messages[0].created_at
            : null;
        SLog(lastTime);
        let key = this.getUserKey(`user_${targetUser.id}_messages`);
        this.setCacheMessages(targetUser.id, messages);
        const SAVE_NUMBER_MESSAGE = 50;
        let saveMessages = [];
        if (messages.length <= SAVE_NUMBER_MESSAGE) {
            saveMessages = messages;
        } else {
            if (!reverse) {
                saveMessages = messages.slice(messages.length - SAVE_NUMBER_MESSAGE, messages.length);
            } else {
                saveMessages = messages.slice(0, SAVE_NUMBER_MESSAGE);
            }
        }
        SLog('saveMessage > messages > after > ' + messages.length);
        Storage.setItem(key, JSON.stringify(saveMessages));
    }

    logout() {
        this
            .socket
            .emit('logout', {device_token : this.deviceToken, device_type : 'android'});
        this.token = null;
        this.user = null;

        Storage.removeItem(AUTHENTICATION_USER_AUTH);
    }

    handlerLogout() {
        this.socket = null;
        this.reconnect();
        this.initListener();
    }

    login(email, password) {
        this.isAuthenticating = true;
        this
            .socket
            .emit('login', {
                email: email,
                password: password,
                access_token: ACCESS_TOKEN
            });
    }

    getEmoticons() {
        return this.emoticons;
    }

    hasEmoticons() {
        return this.emoticons && this.emoticons.length
            ? true
            : false;
    }

    async initEmoticons() {
        return new Promise(async(resolve, reject) => {
            // first try to get from local
            try {
                let bResolve = false;
                if (AppConfig.storage_adapter === 'AsyncStorage') {
                    let value = await AsyncStorage.getItem(EMOTICON_STORAGE_KEY);
                    if (value !== null) {
                        let data = JSON.parse(value);
                        if (data && data.length) {
                            this.emoticons = data;
                            if(!bResolve){
                                resolve(data);
                                bResolve = true;
                            }
                        }
                    }
                } else {
                    MobiStorage.getItem(EMOTICON_STORAGE_KEY).then(item => {
                        if(item){
                            let data = item.toJSON();
                            if (data && data.length) {
                                this.emoticons = data;
                                if(!bResolve){
                                    resolve(data);
                                    bResolve = true;
                                }
                            }
                        }
                    })
                    .catch(err => {
                        
                    })
                }

                // fetch from server
                Api
                    .get('/emoticon.json', null, SOCKET_URL)
                    .then((data) => {
                        this.emoticons = data;
                        if(!bResolve){
                            resolve(this.emoticons);
                            bResolve = true;
                        }
                        Storage.setItem(EMOTICON_STORAGE_KEY, JSON.stringify(this.emoticons));
                    })
                    .catch((error) => {
                        reject(error);
                    });

            } catch (error) {
                reject(error);
            }
        });
    }

    getEmoticonPackage(){
        return new Promise(async(resolve, reject) => {
            if(this.emoticonPackages) return resolve(this.emoticonPackages);

            // try to get from local first
            let emoticons = Emoticon.get();
            if(emoticons && emoticons.length){
                this.emoticonPackages = emoticons;
                // get latest emoticon then get new emoticon
                let latestEmoticon = Emoticon.getLatestEmoticon();
                if(latestEmoticon){
                    Api.get('/emoticons', {
                        time : new Date(latestEmoticon.created_at).toJSON()
                    }, SOCKET_URL).then(data => {
                        if(data.status && data.emoticons){
                            this.emoticonPackages = this.emoticonPackages.concat(data.emoticons);
                            // save emoticon to local
                            Emoticon.saveList(data.emoticons);
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
                }
                return resolve(this.emoticonPackages);
            }
            Api.get('/emoticons', null, SOCKET_URL).then(data => {
                if(data.status && data.emoticons){
                    this.emoticonPackages = data.emoticons;
                    // save emoticon to local
                    Emoticon.saveList(data.emoticons);
                    resolve(this.emoticonPackages);
                }
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    copyMessage(target, message) {
        Object.assign(target, message);
    }

    updateUserProfileImage(user) {
        if (!this.user || !user) 
            return;
        this.user.profile_image = user.profile_image;
        this
            .socket
            .emit('users/update/profile-image', {profile_image: this.user.profile_image});

        this.saveAuthentication();
    }

    uploadProfileImage(imageUri) {
        return new Promise((resolve, reject) => {
            if (!this.user) 
                return reject({error: 'Authentication is required.'});
            if (!imageUri) 
                return reject({error: 'Image not found'});
            var formData = new FormData();

            formData.append('files', {
                uri: imageUri,
                name: 'image.jpg',
                type: 'image/jpeg'
            });

            // Create the config object for the POST You typically have an OAuth2 token that
            // you use for authentication
            const config = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    // 'Content-Type': 'multipart/form-data;'
                },
                body: formData
            }
            let url = `${SOCKET_URL}/users/${this.user.id}/profile-image`;
            SLog('UPLOAD ' + url);
            fetch(url, config).then((response) => {
                // Log the response form the server Here we get what we sent to Postman back
                if (response.ok) {
                    return response.json()
                } else {
                    reject({error: 'Cannot upload image.'});
                }
            }).then((data) => {
                resolve(data);
            }).catch(err => {
                reject(err);
            });
        });
    }

    uploadPhoto(imageUri) {
        return new Promise((resolve, reject) => {
            if (!imageUri) 
                return reject({error: 'Image not found'});
            var formData = new FormData();
            formData.append('files', {
                uri: imageUri,
                name: 'image.jpg',
                type: 'image/jpeg'
            });

            // Create the config object for the POST You typically have an OAuth2 token that
            // you use for authentication
            const config = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    // 'Content-Type': 'multipart/form-data;'
                },
                body: formData
            }
            let url = `${SOCKET_URL}/upload/image`;
            SLog('UPLOAD ' + url);
            fetch(url, config).then((response) => {
                // Log the response form the server Here we get what we sent to Postman back
                if (response.ok) {
                    return response.json()
                } else {
                    reject({error: 'Cannot upload image.'});
                }
            }).then((data) => {
                resolve(data);
            }).catch(err => {
                reject(err);
            });
        });
    }

    getImage(url) {
        if (url.indexOf('http') != -1) 
            return url;
        return SOCKET_URL + url;
    }

    socialLogin(data) {
        this.isAuthenticating = true;
        data.access_token = ACCESS_TOKEN;
        this
            .socket
            .emit('social-login', data);
    }

    getCacheMessages(userId) {
        if (!this.cacheMessages[userId]) 
            return null;
        let meses = this.cacheMessages[userId];
        return meses && meses.length
            ? meses
            : null;
    }

    setCacheMessages(userId, messages) {
        this.cacheMessages[userId] = messages;
    }

    pLog(data) {
        if(!this.socket) return;
        this.socket.emit('log', data);
    }

    updateDeviceToken(token){
        if(token){
            this.deviceToken = token;
        }

        // don't update device token if is user not login
        if(!this.isUser()) return;

        if(!this.deviceToken) {
            return SLog('updateDeviceToken > No device token to update');
        }
        let data = {
            device_token : this.deviceToken,
            device_type : Platform.OS.toLowerCase()
        }
        this.socket.emit('users/update/device-token', data);
    }

    findUser(userId){
        if(this.userIndexes[userId]) return this.userIndexes[userId];
        return null;
    }

    emit(type, data){
        this.socket.emit(type, data);
    }

    send(type, data){
        // return promise, make it easy to check
        return new Promise((resolve, reject) => {
            if(!this.socket) return reject({error : 'Socket is not ready.'});
            data.client_id_key = Utils.createUniqueString(16);
            let isTimeout = false;
            this.addEventListener(data.client_id_key, (data) => {
                SLog('send > success')
                if(isTimeout) return;
                resolve(data);
                if(this.timers[data.client_id_key]){
                    clearTimeout(this.timers[data.client_id_key]);
                    this.timers[data.client_id_key] = undefined;
                }
            });

            this.timers[data.client_id_key] = setTimeout(() => {
                SLog('send > timeout');
                isTimeout = true;
                reject({error : 'Connection timeout! Please try again later.'});
                this.timers[data.client_id_key] = undefined;
            }, SOCKET_SENDING_TIMEOUT);
            
            this.socket.emit(type, data);
        });
    }

    handleOtherEvents(type, data) {
        SLog('handleOtherEvents');
        this.fireCallBack(type, data);
    }

    on(type, callback){
        if(this.customEvents[type]){
            // already listen this event simple add callback
            return this.setCallBack(type, callback);
        }
        SLog('on ' + type);
        this.customEvents[type] = true;
        this.socket.on(type, (event) => this.handleOtherEvents(type, event));

        this.setCallBack(type, callback);
    }

    off(type, callback){
        this.removeCallback(type, callback);
    }

    removeAllListeners(type){
        this.socket.removeAllListeners(type);
        this.callbacks[type] = [];
    }
}

const MobiSocket = new MobiSocketService();
export default MobiSocket;