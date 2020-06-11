import {ToastAndroid, Platform, Alert} from 'react-native';

export default class Toast{
    static show(message, defaultMessage){
        if(!message) return;
        let mes = '';
        if(typeof message === 'string'){
            mes = message;
        }
        else if(typeof message === 'object'){
            if(message.message){
                mes = message.message;
            }
            else if(message.err){
                if(typeof message.err === 'string'){
                    mes = message.err;
                }
                else {
                    let err = message.err;
                    mes = err.message || err.err || err.error || '';
                }
            }
            else if(message.error){
                if(typeof message.error === 'string'){
                    mes = message.error;
                }
                else {
                    let err = message.error;
                    mes = err.message || err.err || err.error || '';
                }
            }
        }

        if(Platform.OS === 'android'){
            if(mes && typeof mes === 'string'){
                ToastAndroid.show(mes, ToastAndroid.SHORT);
            }
            else if(defaultMessage){
                ToastAndroid.show(defaultMessage, ToastAndroid.SHORT);
            }
        }
        else{
            if(mes && typeof mes === 'string'){
                Alert.alert('Alert', mes);
            }
            else if(defaultMessage){
                Alert.alert('Alert', defaultMessage);
            }
        }
    }
}