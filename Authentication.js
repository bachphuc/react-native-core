import Api from './Api';

export const AUTHENTICATION_TOKEN_KEY = 'authentication-token';
export const AUTHENTICATION_USER_KEY = 'authentication-user';
export const AUTHENTICATION_USER_AUTH = 'authentication-auth';

/**
 * @class AuthenticationService Service to handle auth.
 */
class AuthenticationService {
    constructor() {
        this.user = null;
        this.token = null;

        this._storageHandler = null;
        this._logHandler = null;
    }

    /**
     * Sets storage handler.
     * @param {object} handler Handler save and read auth data.
     */
    setStorageHandler(handler){
        this._storageHandler = handler;
    }

    /**
     * Sets log handler.
     * @param {func} handler Log handler
     */
    setLogHandler(handler){
        this._logHandler = handler;
    }

    log(data){
        if(!this._logHandler) return;

        if(typeof this._logHandler !== 'function') return;
        this._logHandler(data);
    }

    /**
     * Sets current user.
     * @param {User} user Sets current user.
     */
    setUser(user) {
        this.user = user;
    }

    /**
     * Sets current token.
     * @param {string} token Auth Token.
     */
    setToken(token) {
        this.token = token;

        Api.setCustomHeader(AUTHENTICATION_TOKEN_KEY, token);
    }

    /**
     * Gets auth token.
     * @return {string} Current user token.
     */
    getToken() {
        return this.token;
    }

    /**
     * Gets current user.
     * @return {User} Current user.
     */
    getUser() {
        return this.user;
    }

    getUserId(){
        return this.user ? this.user.id : 0;
    }

    get userId(){
        return this.getUserId();
    }

    isSelf(user){
        return user.id == this.user.id ? true : false;
    }

    isUser() {
        return this.user ? true : false;
    }

    isLoggedIn(){
        return this.user && this.token ? true: false;
    }

    /**
     * Checks if current logged in user is admin.
     * @return {boolean} Is admin or not.
     */
    isAdmin(){
        return this.user ? (this.user.role == 'admin' || this.user.role == 'super_admin') : false;
    }

    isStaff(){
        return this.user ? (this.user.role == 'admin' || this.user.role == 'super_admin' || this.user.role == 'editor') : false;
    }

    isSuperAdmin(){
        return this.user ? (this.user.role == 'super_admin') : false;
    }

    canDeleteItem(item){
        return this.user ? (this.isAdmin() ? true : (this.user.id == item.user_id ? true : false)) : false;
    }

    /**
     * Sets authentication data with user and token.
     * @param {object} data Authentication data
     */
    setAuthenticationData(data) {
        if (data[AUTHENTICATION_TOKEN_KEY]) {
            this.setToken(data[AUTHENTICATION_TOKEN_KEY]);
        }
        if (data[AUTHENTICATION_USER_KEY]) {
            let user = JSON.parse(data[AUTHENTICATION_USER_KEY]);
            this.setUser(user);
        }
    }

    onUpdateProfileListener(listener){
        this.updateProfileListener = listener;
    }

    fireUpdateProfileEvent(){
        if(this.updateProfileListener){
            this.updateProfileListener(this.getUser());
        }
    }

    /**
     * Saves authentication data to local.
     */
    saveAuthentication() {
        if (!this.token || !this.user) return false;
        this.log(`saveAuthentication`)
        this._storageHandler.setItem(AUTHENTICATION_USER_AUTH, {
            token: this.token,
            user: this.user
        }).then((status) => {
            this.log(`saveAuthentication > success, status: ${status}`)
        })
        .catch(err => {
            this.log(`saveAuthentication failed`);
            this.log(err);
        })
    }

    /**
     * Initializes authentication token at the first time.
     */
    initAuthentication() {
        this.log(`initAuthentication`)
        return new Promise((resolve, reject) => {
            if(this.user){
                return resolve(this.user);
            }

            if(!this._storageHandler){
                reject({error: 'MISSING CONFIG STORAGE HANDLE for Authentication Service'})
            }
            else{
                this._storageHandler.getItem(AUTHENTICATION_USER_AUTH).then((auth) => {
                    if(auth){
                        this.setUser(auth.user);
                        this.setToken(auth.token);
                        resolve(auth.user);
                    }
                    else{
                        reject({error: 'No authentication'})
                    }
                })
                .catch((err) => {
                    reject(err);
                })
            }
        });
    }

    /**
     * Logout from app.
     */
    logout() {
        Api.get('logout').then(res => {
            this._storageHandler.removeItem(AUTHENTICATION_USER_AUTH).then(() => {
                this.log(`Authentication > logout success`)
                this.fireOnAuthenticationChanged();
            })
            .catch(err => {

            })
        })
        .catch(err => {
            this._storageHandler.removeItem(AUTHENTICATION_USER_AUTH).then(() => {
                this.log(`Authentication > API failed > logout success`)
                this.fireOnAuthenticationChanged();
            })
            .catch(err => {

            })
        });
        this.token = null;
        this.user = null;
    }

    /**
     * Login
     * @param {object} data Login parameters
     */
    login(data){
        return new Promise((resolve, reject) => {
            Api.post('login', data).then((res) => {
                if(res.status){
                    resolve(res);
                }
                else{
                    reject(res);
                }
            })
            .catch(err => {
                this.log(err);
                reject(err);
            });
        })
    }

    /**
     * Register a new account.
     * @param {object} data Register data.
     */
    register(data){
        return new Promise((resolve, reject) => {
            Api.post('register', data).then((res) => {
                if(res.status){
                    resolve(res);
                }
                else{
                    reject(res);
                }
            })
            .catch(err => {
                this.log(err);
                reject(err);
            });
        });
    }

    /**
     * Alias of register API.
     * @param {data} data register data
     */
    signup(data){
        return this.register(data);
    }

    /**
     * Sets and saves authentication to local.
     * @param {object} data Authentication data.
     */
    saveLogin(data){
        if(!data) return;
        if(data.user){
            this.user = data.user;
        }
        
        if(data.token){
            this.token = data.token;
        }

        this._storageHandler.setItem(AUTHENTICATION_USER_AUTH, data).then(() => {
            this.log(`Authentication > save auth successfully`)
            this.fireOnAuthenticationChanged();
        })
        .catch(err => {
            this.log(`Authentication > failed to save user data`)
            this.log(err);
        })        
    }

    /**
     * Sets listener to listen authentication change.
     * @param {func} cb Listener when authentication is changed.
     */
    onAuthenticationChanged(cb){
        this._authenticationChangedCb = cb;
    }

    fireOnAuthenticationChanged(){
        this._authenticationChangedCb && this._authenticationChangedCb(this.isLoggedIn());
    }

    /**
     * Gets current user email.
     * @return {string} Current user email.
     */
    get userEmail(){
        if(!this.user) return '';
        return this.user.email;
    }

    get name(){
        if(!this.user) return '';
        return this.user.name;
    }
}

const Authentication = new AuthenticationService();
export default Authentication;