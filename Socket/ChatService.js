import socket from './../Socket/MobiSocket';

let instance = null;

import ChatMessage from 'app/Models/ChatMessage';
import ChatUser from 'app/Models/ChatUser';

import {Utils, Log} from './../Utils';

const TAG = 'ChatService';
function log(data){
    if(!data) return;
    Log(`${TAG} > ${JSON.stringify(data)}`);
}

class ChatService{
    static getInstance() {
        if (instance) 
            return instance;
        instance = new ChatService();
        return instance;
    }

    getLocalMessages(targetUser, params){
        let messages = ChatMessage.getOf(targetUser, params);
        return messages;
    }

    getRemoteMessages(targetUser, params){
        params.user_id = targetUser.id;
        return socket.send('messages/from', params);
    }

    saveListMessages(target, messages){
        messages.forEach(m => {
            if(!m.target_user_id){
                m.target_user_id = target.id;
            }
        });
        ChatMessage.saveList(messages);
    }

    createMessage(targetUser, params) {
        if (!targetUser) return false;

        let user = socket.getUser();
        
        let message = {
            client_key: Utils.createUniqueString(16),
            username: user.full_name,
            user_name: user.full_name,
            created_at: (new Date()).toJSON(),
            user_id: user.id,
            target_user_id : targetUser.id,
            message_status : 'sending',
            target_user : targetUser
        };

        Object.assign(message, params);

        if(!message.message_type){
            message.message_type = 'text';
        }

        if(params.message_type == 'animate_emoticon'){
            message.emoticon_autoplay = true;
            if(params.emoticon){
                for(let k in params.emoticon){
                    message['emoticon_' + k] = params.emoticon[k];
                }
            }
        }

        return message;
    }

    send(message){
        if(message.target_user){
            message.target_user.last_updated = new Date();
            if(message.message){
                message.target_user.last_message = message.message;
            }
        }
        
        // save this message to local
        ChatMessage.save(message);

        // update last_updated time for this user :)
        ChatUser.save({
            id : message.target_user_id,
            last_updated : new Date(),
            last_message : message.message || ''
        });

        let sendData = Object.assign({}, message);
        if(sendData.target_user){
            sendData.target_user = undefined;
        }
        sendData.new_version = true;
        return socket.send('messages/to', sendData);
    }

    makeAsReadMessage(targetUser, message){
        if (!targetUser || !message) 
        return;
        log('makeAsReadMessage');
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
        socket.emit('messages/update', data);
    }

    isOwner(message) {
        let user = socket.getUser();
        return message.user_id == user.id ? true : false;
    }
}

const chatService = ChatService.getInstance();
export default chatService;