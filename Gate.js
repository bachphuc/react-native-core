import Api from './Api';
import ImageResizer from 'react-native-image-resizer';
import Config from 'app/Config';
import MobiSocket from './Socket/MobiSocket';
import {Log} from './Utils';
import GlobalData from './GlobalData';
import MobiStorage from './MobiStorage';

var termAndConditionsContent = null;
var reportReasons = null;

export default class Gate{
    static toggleLike(itemType, itemId){
        return Api.post('toggleLike', {item_type : itemType, item_id : itemId});
    }

    static postComment(params){
        return Api.post('comments', params);
    }

    static getPostComments(postId){
        return Api.get(`posts/${postId}/comments`);
    }

    static makeAsReadNews(newsId){
        return Api.get(`newses/${newsId}/make-as-read`);
    }

    static postStatus(params, onProgress){
        return Api.upload(`posts`, params, onProgress);
    }

    static getPosts(params){
        return Api.get(`posts`, params);
    }

    static getNewPosts(params){
        return Api.get(`posts/v/new`, params);
    }

    static getUserPost(userId, params){
        return Api.get(`users/${userId}/posts`, params);
    }

    static deletePost(postId){
        return Api.delete(`posts/${postId}`);
    }

    static updateDeviceToken($deviceToken, $deviceType){
        return Api.post('update-device-token', {
            device_token : $deviceToken,
            device : $deviceType
        });
    }

    static getPostDetail(postId){
        return Api.get(`posts/${postId}`);
    }

    static makeAsReadNotification(id){
        return Api.get(`notifications/${id}/make-as-read`);
    }

    static deleteNotification(id){
        return Api.delete(`notifications/${id}`);
    }

    static getTotalUnread(){
        return Api.get(`notifications/v/total-unread`);
    }

    static makeAsReadAll(){
        return Api.get(`notifications/a/makeAsReadAll`);
    }

    static register(params){
        return Api.post(`register`, params);
    }

    static updateProfile(params, onProgress){
        return Api.upload(`profile`, params, onProgress);
    }

    static getProfile(){
        return Api.get(`profile`);
    }

    static getUserDetail(userId){
        return Api.get(`users/${userId}`);
    }

    static getComments(itemType, itemId){
        return Api.get(`comments?item_type=${itemType}&item_id=${itemId}`);
    }

    static follow(userId){
        return Api.get(`users/${userId}/follow`);
    }

    static unfollow(userId){
        return Api.get(`users/${userId}/unfollow`);
    }

    static suggestions(){
        return Api.get(`users/v/suggestions`);
    }

    static login(params){
        return Api.post(`login`, params);
    }

    static socialLogin(params){
        return Api.post(`social-login`, params);
    }

    static uploadPhoto(photo){
        if(!photo || !photo.uri) return false;
        MobiSocket.pLog(`Gate > uploadPhoto > ${photo.uri} `);
        if(photo.width > Config.MAX_IMAGE_WIDTH){
            return new Promise((resolve, reject) => {
                // need to resize this image then upload
                MobiSocket.pLog(`Gate > uploadPhoto > before > createResizedImage > ${photo.uri} `);
                ImageResizer.createResizedImage(photo.uri, Config.MAX_IMAGE_WIDTH, Config.MAX_IMAGE_HEIGHT, 'JPEG', 85, 0, null).then((resizedImageUri) => {
                    Log(resizedImageUri);
                    MobiSocket.pLog(`Gate > uploadPhoto > createResizedImage > success > ${resizedImageUri.uri} `);
                    // return this.setState({resizedImageUri : resizedImageUri});
                    // resizeImageUri is the URI of the new image that can now be displayed, uploaded...
                    // newPhotoUri: resizedImageUri.uri
                    let postData = {};
                    postData['image'] = {
                        uri: resizedImageUri.uri,
                        name: 'image.jpg',
                        type: 'image/jpeg'
                    };
                    
                    Api.post(`photos`, postData).then((data) => {
                        MobiSocket.pLog(`Gate > uploadPhoto > createResizedImage > success > upload > ${resizedImageUri.uri} `);
                        resolve(data);
                    }).catch(error => {
                        Log(error);
                        reject(error);
                    });

                }).catch((err) => {
                    MobiSocket.pLog(`Gate > uploadPhoto > createResizedImage > failed > ${photo.uri} `);
                    // Oops, something went wrong. Check that the filename is correct and
                    // inspect err to get more details.
                    Log(err);
                    reject(err);
                });
            });
        }

        MobiSocket.pLog(`Gate > uploadPhoto > not resize > uploading > ${photo.uri} `);
        let postData = {};
        postData['image'] = {
            uri: photo.uri,
            name: 'image.jpg',
            type: 'image/jpeg'
        };

        return Api.post(`photos`, postData);
    }

    static getTermAndConditions(){
        return new Promise((resolve, reject) => {
            if(termAndConditionsContent){
                return resolve(termAndConditionsContent);
            }
            Api.get('term-and-conditions').then(data => {
                if(data.status){
                    termAndConditionsContent = data.content;
                    resolve(termAndConditionsContent);
                }
                else{
                    reject(data.message || 'Oops, something was wrong.');
                }
            }).catch(error => {
                reject(error);
            });
        });
    }

    static getLinkInfo(link){
        let options = {
            headers : {},
            useUrlEncoded : true
        };

        return Api.post('/link-info', {link : link }, Config.SOCKET_URL, options);
    }

    static getReportReasons(){
        return new Promise((resolve, reject) => {
            if(reportReasons){
                return resolve(reportReasons);
            }
            Api.get('reasons').then(data => {
                if(data.status){
                    reportReasons = data.reasons;
                    return resolve(reportReasons);
                }
                else{
                    reject(data.message || 'Oops, something was wrong.');
                }
            }).catch(error => {
                reject(error);
            });
        });
    }

    static report(params){
        return Api.post('report', params);
    }

    static block(params){
        return Api.post('block', params);
    }

    static getPageProfile(pageId){
        return Api.get(`pages/${pageId}`);
    }

    static save(itemType, itemId){
        return Api.post('save', {item_type : itemType, item_id : itemId});
    }

    static getVideoDetail(id){
        return Api.get(`videos/${id}`);
    }

    static toggleSave(itemType, itemId){
        return Api.post('toggleSave', {item_type : itemType, item_id : itemId});
    }

    static getPages(){
        return new Promise((resolve, reject) => {
            let apiKey = 'pages';
            if(GlobalData.has(apiKey)){
                return resolve(GlobalData.get(apiKey));
            }
            Api.get(apiKey).then(data => {
                if(data.status && data.pages){
                    GlobalData.set(apiKey, data.pages);
                    resolve(data.pages);
                }
                else{
                    resolve([]);
                }
            })
            .catch(err => reject(err));
        });
    }

    static saveAudio(audio){
        return Api.post('audios/a/save', audio);
    }

    static getSavedAudios(){
        return Api.get('saved', {item_type : 'audio'});
    }

    static checkSavedAudio(audio){
        let params = {};
        if(audio.id){
            params.id = audio.id;
        }
        else if(audio.key){
            params.key = audio.key;
        }
        return Api.post('audios/a/check-saved', params);
    }

    static unSaveAudio(audio){
        let params = {};
        if(audio.id){
            params.id = audio.id;
        }
        else if(audio.key){
            params.key = audio.key;
        }
        return Api.post('audios/a/unsave', params);
    }

    static toggleSaveAudio(audio){
        if(audio.is_saved) return Gate.unSaveAudio(audio);
        return Gate.saveAudio(audio);
    }

    static uploadPhotoV2(photo, onProgress){
        if(!photo || !photo.uri) return false;
        MobiSocket.pLog(`Gate > uploadPhoto > ${photo.uri} `);
        if(photo.width > Config.MAX_IMAGE_WIDTH){
            return new Promise((resolve, reject) => {
                // need to resize this image then upload
                MobiSocket.pLog(`Gate > uploadPhoto > before > createResizedImage > ${photo.uri} `);
                ImageResizer.createResizedImage(photo.uri, Config.MAX_IMAGE_WIDTH, Config.MAX_IMAGE_HEIGHT, 'JPEG', 85, 0, null).then((resizedImageUri) => {
                    Log(resizedImageUri);
                    MobiSocket.pLog(`Gate > uploadPhoto > createResizedImage > success > ${resizedImageUri.uri} `);
                    // return this.setState({resizedImageUri : resizedImageUri});
                    // resizeImageUri is the URI of the new image that can now be displayed, uploaded...
                    // newPhotoUri: resizedImageUri.uri
                    let postData = {};
                    postData['image'] = {
                        uri: resizedImageUri.uri,
                        name: 'image.jpg',
                        type: 'image/jpeg'
                    };
                    
                    Api.upload(`photos`, postData, (percent) => {
                        if(onProgress){
                            onProgress(percent);
                        }
                    }).then((data) => {
                        MobiSocket.pLog(`Gate > uploadPhoto > createResizedImage > success > upload > ${resizedImageUri.uri} `);
                        resolve(data);
                    }).catch(error => {
                        Log('uploadPhotoV2 > upload > failed');
                        Log(error);
                        reject(error);
                    });

                }).catch((err) => {
                    MobiSocket.pLog(`Gate > uploadPhoto > createResizedImage > failed > ${photo.uri} `);
                    Log(`Gate > uploadPhoto > createResizedImage > failed > ${photo.uri} `);
                    // Oops, something went wrong. Check that the filename is correct and
                    // inspect err to get more details.
                    Log(err);
                    reject(err);
                });
            });
        }

        MobiSocket.pLog(`Gate > uploadPhoto > not resize > uploading > ${photo.uri} `);
        let postData = {};
        postData['image'] = {
            uri: photo.uri,
            name: 'image.jpg',
            type: 'image/jpeg'
        };

        return Api.upload(`photos`, postData, (percent) => {
            if(onProgress){
                onProgress(percent);
            }
        });
    }

    static getApiCache(apiUrl, onLoadCacheSuccess){
        return new Promise((resolve, reject) => {

            let cacheData = null;

            Api.get(apiUrl).then(response => {
                resolve(response);
                // save this response
                MobiStorage.setItem(apiUrl, response);
                cacheData = null;
            })
            .catch(err => {
                if(cacheData && !onLoadCacheSuccess){
                    resolve(cacheData);
                }
                else{
                    reject(err);
                }
                cacheData = null;
            });

            MobiStorage.getItem(apiUrl).then((item) => {
                if(item){
                    cacheData = item.toJSON();
                    onLoadCacheSuccess(cacheData);
                }
            })
            .catch(err => {})
        });
    }

    static getProvinces(){
        return new Promise((resolve, reject) => {
            const key = 'provinces';
            if(GlobalData.has(key)){
                resolve(GlobalData.get(key));
                return;
            }

            Api.get('provinces').then(data => {
                if(data.status){
                    GlobalData.set(key, data);
                    resolve(data);
                }
                else{
                    reject({error: data.message});
                }
            })
            .catch(err => reject(err));
        })
    }
}

