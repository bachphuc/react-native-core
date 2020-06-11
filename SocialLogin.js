import {Platform} from 'react-native';
import {FBLogin, FBLoginManager} from 'react-native-fbsdk';
import {GoogleSignin} from '@react-native-community/google-signin';
import {Log} from './Utils';
import Gate from './Gate';
import Config from 'app/Config';

let instance = null;

class SocialLogin{
    static getInstance() {
        if (instance) return instance;
        instance = new SocialLogin();
        return instance;
    }

    onGoogleSignIn(googleUser, callback) {
        if(!googleUser) return;
        this._socialLogin('google', {
            social_type : 'google',
            social_id : googleUser.id,
            name: googleUser.name,
            email : googleUser.email,
            image : googleUser.photo || ''
        }, callback);
    }

    _socialLogin(socialType, params, callback){
        Gate.socialLogin(params).then(data => {
            Log(data);
            callback(false, {
                type : socialType,
                data : data
            });
        })
        .catch(err => {
            callback(err);
        });
    }

    loginGoogle(){
        if(Platform.OS == 'android') return this.loginWithGoogleAndroid();
        return this.loginWithGoogleIOS();
    }

    loginWithGoogleAndroid(){
        return new Promise((resolve, reject) => {
            GoogleSignin.hasPlayServices({autoResolve: true}).then(() => {
                // play services are available. can now configure library nothing to config for
                // android
                GoogleSignin.configure({}).then(() => {
                    // you can now call currentUserAsync()
                    GoogleSignin.currentUserAsync().then((user) => {
                        Log('loginWithGoogle > currentUserAsync');
                        Log(user);
                        if (!user) {
                            // login here
                            GoogleSignin.signIn().then((user) => {
                                Log('loginWithGoogle > currentUserAsync > GoogleSignin');
                                Log(user);
                                this.onGoogleSignIn(user, (err, data) => {
                                    if(err){
                                        reject(err);
                                    }
                                    else{
                                        resolve(data);
                                    }
                                });
                            })
                            .catch((err) => {
                                Log('WRONG SIGNIN');
                                Log(err);
                                reject(err);
                            })
                            .done();
                        } else {
                            // handle login at server here
                            this.onGoogleSignIn(user, (err, data) => {
                                if(err){
                                    reject(err);
                                }
                                else{
                                    resolve(data);
                                }
                            });
                        }
                    })
                    .done();
                });
            })
            .catch((err) => {
                Log("Play services error");
                reject(err);
            })
        });
    }

    loginWithGoogleIOS = () => {
        return new Promise((resolve, reject) => {
            GoogleSignin.configure({
                iosClientId : Config.IOS_GOOGLE_CLIENT_ID
            }).then(() => {
                // you can now call currentUserAsync()
                GoogleSignin.currentUserAsync().then((user) => {
                    Log('loginWithGoogle > currentUserAsync');
                    Log(user);
                    if (!user) {
                        // login here
                        GoogleSignin.signIn().then((user) => {
                            Log('loginWithGoogle > currentUserAsync > GoogleSignin');
                            Log(user);
                            this.onGoogleSignIn(user, (err, data) => {
                                if(err){
                                    reject(err);
                                }
                                else{
                                    resolve(data);
                                }
                            });
                        })
                        .catch((err) => {
                            Log('WRONG SIGNIN');
                            reject(err);
                        })
                        .done();
                    } else {
                        // handle login at server here
                        this.onGoogleSignIn(user, (err, data) => {
                            if(err){
                                reject(err);
                            }
                            else{
                                resolve(data);
                            }
                        });
                    }
                })
                .done();
            }).catch(error => {
                reject(error);
            });
        });
    }

    loginFacebook(){
        if(Platform.OS == 'android') return this.loginWithFacebookAndroid();
        return this.loginWithFacebookIOS();
    }

    loginWithFacebookAndroid(){
        return new Promise((resolve, reject) => {
            FBLoginManager.loginWithPermissions(["email"], (error, data) => {
                if (!error) {
                    Log(data);
                    let profile = data.profile;
                    if(typeof profile === 'string'){
                        profile = JSON.parse(profile);
                    }
                    Log('profile');
                    Log(profile);
    
                    this._socialLogin('facebook', {
                        social_type : 'facebook',
                        social_id : profile.id,
                        name: profile.name,
                        first_name : profile.first_name,
                        last_name : profile.last_name,
                        email : profile.email || '',
                        // image : profile.picture && profile.picture.data && profile.picture.data.url ? profile.picture.data.url : '',
                        image : `https://graph.facebook.com/${profile.id}/picture?type=large`,
                    }, (err, data) => {
                        if(err) return reject(err);
                        resolve(data);
                    });
                } else {
                    Log("loginWithFacebook > error")
                    Log(error);
                    if(error.type == 'cancel'){
                        error.message = 'User cancelled login facebook.';
                    }
                    reject(error);
                }
            });
        });
    }

    loginWithFacebookIOS (){
        return new Promise((resolve, reject) => {
            FBLoginManager.loginWithPermissions(["email"], (error, data) => {
                if (!error) {
                    Log(data);
                    let credentials = data.credentials;
                    let userId = credentials.userId;
                    let token = credentials.token;
                    this.getFacebookUser(token).then(profile => {
                        if(profile){
                            Log('profile');
                            Log(profile);
                            if(profile.error){
                                return reject(profile.error);
                            }
        
                            this._socialLogin('facebook', {
                                social_type : 'facebook',
                                social_id : profile.id,
                                name: profile.name,
                                first_name : profile.first_name || '',
                                last_name : profile.last_name || '',
                                email : profile.email || '',
                                image : profile.picture && profile.picture.data && profile.picture.data.url ? profile.picture.data.url : ''
                            }, (err, data) => {
                                if(err) return reject(err);
                                resolve(data);
                            });
                        }
                        else{
                            this.handlerLoginFailed(null);
                        }
                    })
                    .catch(error => {
                        reject(error);
                    });
                } else {
                    Log("loginWithFacebook > error")
                    Log(error);
                    reject(error);
                }
            });
        });
    }

    getFacebookUser = (token) => {
        return new Promise((resolve, reject) => {
            fetch('https://graph.facebook.com/v2.5/me?fields=email,name,first_name,last_name,friends,picture&access_token=' + token)
            .then((response) => response.json())
            .then((json) => {
                Log(json);
                return resolve(json);                    
            }).catch(() => {
                reject('ERROR GETTING DATA FROM FACEBOOK');
            });
        });
    }
}

let socialLogin = SocialLogin.getInstance();
export default socialLogin;