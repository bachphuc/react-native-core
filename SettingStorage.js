import AsyncStorage from '@react-native-community/async-storage';

/**
 * @class SettingStorageService
 */
export class SettingStorageService{
    constructor(){

    }

    /**
     * Saves data with key.
     * @param {string} key 
     * @param {object} value Data to storage.
     * @return {Promise} Promise
     */
    setItem(key, value){
        let data = JSON.stringify(value);
        return AsyncStorage.setItem(key, data);
    }

    /**
     * Gets saved data by key.
     * @param {string} key setting key.
     * @return {Promise}
     */
    getItem(key){
        return new Promise((resolve, reject) => {
            AsyncStorage.getItem(key).then((value) => {
                try{
                    let data = JSON.parse(value);
                    resolve(data);
                }
                catch(e){
                    reject(e);
                }
            })
            .catch(err => {
                reject(err);
            })
        })
    }   

    /**
     * Removed saved setting by setting key.
     * @param {string} key Key to remove.
     */
    removeItem(key){
        if(!key) return;
        return AsyncStorage.removeItem(key);
    }
}

const SettingStorage = new SettingStorageService();

export default SettingStorage;