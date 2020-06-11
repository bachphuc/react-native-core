let now = new Date();
const TIMEZONE_OFFSET = Math.round(-1 * now.getTimezoneOffset() / 60);

/**
 * @class ApiService API helper service. 
 */
export class ApiService {
    data = {};

    /**
     * @constructor
     */
    constructor() {
        this._HOST_URL = '';
        this._API_HOST_URL = '';
        this._DEFAULT_IMAGE = '';
        

        // this.token = null;
        this.language = 'en';
        this.networkStatus = {type : 'OK'};

        this._customHeaders = {};

        this._logHandler = null;
        this._netInfoHandler = null;

        // LOG MODE 0: no log, 1, log url with status, 2 log full.
        this._LOG_MODE = 1;

        // number retry when request failed.
        this._RETRY_NUMBER = 3;
    }

    /**
     * Sets number attempt when request failed.
     * @param {number} number total attempt to retry.
     */
    setRetryNumber(number){
        this._RETRY_NUMBER = number;
    }

    /**
     * Sets api request log mode.
     * @param {string} mode log mode. 0 no log, 1 log only url and request status, 2 log full response
     */
    setLogMode(mode){
        this._LOG_MODE = mode;
    }

    setLogHandler(handler){
        this._logHandler = handler;
    }

    setNetInfoHandler(handler){
        this._netInfoHandler = handler;
    }

    /**
     * Logs data to console.
     * @param {any} data data to log
     */
    log(data){
        if(!this._logHandler) return null;
        if(typeof this._logHandler !== 'function') return;
        this._logHandler(data);
    }

    get host(){
        return this._HOST_URL;
    }

    /**
     * host set host URL
     * @param v url
     */
    set host(v){
        this._HOST_URL = v;
        this._DEFAULT_IMAGE = this._HOST_URL + '/icon_upload_photo.png';
    }

    get apiHost(){
        return this._API_HOST_URL;
    }

    set apiHost(v){
        this._API_HOST_URL = v;
    }

    /**
     * Sets custom request headers
     * @param {object} headers custom header object with key value
     */
    setCustomHeaders(headers){
        if(!headers) return;

        for(let key in headers){
            this._customHeaders[key] = headers[key];
        }
    }

    /**
     * Sets custom header request.
     * @param {string} key header name
     * @param {string} value header value
     */
    setCustomHeader(key, value){
        this._customHeaders[key] = value;
    }

    /**
     * Resets all custom request headers.
     */
    resetCustomHeaders(){
        this._customHeaders = {};
    }

    init(){
        if(!this._netInfoHandler) return;

        this._netInfoHandler.getConnectionInfo().then((connectionInfo) => {
            this.networkStatus = connectionInfo;
        });

        this._netInfoHandler.addEventListener('connectionChange', this.handleConnectivityChange);
    }

    destroy(){
        if(this._netInfoHandler){
            this._netInfoHandler.removeEventListener('connectionChange', this.handleConnectivityChange);
        }
    }

    handleConnectivityChange = (connectionInfo) => {
        this.networkStatus = connectionInfo;
    }

    /**
     * Checks if there's no internet connection.
     */
    isOffline(){
        return this.networkStatus.type === 'NONE' ? true : false;
    }

    /**
     * Serializes an object to query string.
     * @param {object} data parameters
     * @return {string} The query parameters string.
     */
    serialize(data) {
        let ars = [];

        for (let k in data) {
            if(data[k] !== undefined && data[k] !== 'undefined'){
                let v = data[k];
                if(v instanceof Date){
                    ars.push(`${k}=${window.encodeURIComponent(v.toJSON())}`);
                }
                else if(typeof v === 'object'){
                    let tmp = JSON.stringify(v);
                    this.log(v);
                    ars.push(`${k}=${window.encodeURIComponent(tmp)}`);
                }
                else{
                    ars.push(`${k}=${window.encodeURIComponent(v)}`);
                }
            }
        }

        return ars.join('&');
    }

    /**
     * Gets full image URL.
     * @param {string} image Image path.
     * @return {string} The full image URL.
     */
    getImage(image){
        if(!image) return this._DEFAULT_IMAGE;

        // this image is local image
        if(typeof image === 'string' && image.indexOf('content:') !== -1){
            return image;
        }

        // This URL is full so return.
        if(typeof image === 'string' && image.indexOf('http') !== -1) return image;
        
        if(image && typeof image === 'object'){
            image = image.thumbnail_720 || image.image || '';
        }
        
        let result = image;
        if(!image){
            result = this._DEFAULT_IMAGE;
        }
        else if(image.indexOf('http') === -1){
            result = this.cleanPath(this._HOST_URL) + '/' + this.cleanPath(image);
        } 
        if(result[result.length -1] == '.'){
            result = result.substring(0, result.length -1 );
            result+= '%2E';
        }
        return result;
    }

    /**
     * Gets full URL from url path without domain.
     * @param {string} url The URL path.
     * @return {string} The full URL.
     */
    getUrl(url){
        if(!url) return this._HOST_URL;
        if(url.indexOf('http') != -1) return url;
        return this._HOST_URL + '/' + url;
    }

    initHeader(){
        let headers = {
            language : this.language || 'en',
            'timezone' : TIMEZONE_OFFSET
        };

        for(let key in this._customHeaders){
            headers[key] = this._customHeaders[key];
        }

        return headers;
    }

    /**
     * Makes request use fetch API.
     * @param {string} url The request URL.
     * @param {object} options The request parameters
     */
    fetch(url, options){
        return fetch(url, options);
    }

    cleanPath(path){
        if(!path) return '';
        return path.trim().replace(/^[\/\s]+/, '').replace(/[\s\/]+$/, '');
    }

    /**
     * Gets full API URL from API path.
     * @param {string} path API path.
     * @param {string} apiHost Override current API host.
     * @return {string} Full API URL.
     */
    getApiUrl(path, apiHost){
        if(!path) return (apiHost || this._API_HOST_URL);
        if(path.indexOf('http') !== -1) return path;
        path = this.cleanPath(path);
        let host = this.cleanPath(apiHost || this._API_HOST_URL);
        return host + '/' + path;
    }

    /**
     * make a GET request
     * @param {string} path API path
     * @param {object} params request parameters
     * @param {string} apiHost override api host
     */
    get(path, params, apiHost = null) {
        let url = this.getApiUrl(path, apiHost);
        if(params){
            let queryString = this.serialize(params);
            if(queryString){
                url+= `?${queryString}`;
            }
        }
        if(this._LOG_MODE){
            this.log('API GET ' + url);
        }
        
        return new Promise((resolve, reject) => {
            let headerObj = this.initHeader();
            let currentRequest = 0;

            let request = (resolve, reject) => {
                fetch(url, {
                    method: 'GET',
                    headers: headerObj
                }).then(response => {
                    if(response.ok){
                        return response.json()
                    }
                    else{
                        this.log(response);
                        if(response.status == 404){
                            return reject({message : 'Request Not Found.'});
                        }
                        else if(response.status == 405){
                            return reject({message : 'Method Not Allowed..'});
                        }
                        else if(response.status == 500){
                            return reject({message : 'Internal Server Error'});
                        }
                        reject({statusCode : response.status, statusText : response.statusText, message : response.statusText, url : response.url});
                    }
                })
                .then(data => {
                    if(this._LOG_MODE){
                        this.log(`Success GET ${url}`);
                    }
                    if(this._LOG_MODE > 1){
                        this.log(data);
                    }
                    
                    resolve(data);
                })
                .catch(error => {
                    errorHandler(reject, error);
                });
            }

            let errorHandler = (reject, error) => {
                if(this._LOG_MODE){
                    this.log('API Failed GET: ' + url);
                    this.log(error);
                    this.log(error.message);
                }
                currentRequest++;
                if(currentRequest >= this._RETRY_NUMBER){
                    this.log('API reject GET: ' + url);
                    reject(error);
                }
                else{
                    this.log('API RETRY GET ' + url);
                    request(resolve, reject);
                }
            }

            request(resolve, reject);
        });
    }

    /**
     * Makes DELETE request.
     * @param {string} path API path.
     * @param {object} params Request parameters.
     * @param {string} apiHost Override current api host URL.
     * @return {Promise} Promise
     */
    delete(path, params, apiHost = null) {
        let url = this.getApiUrl(path, apiHost);
        if(this._LOG_MODE){
            this.log('API DELETE ' + url);
        }
        return new Promise((resolve, reject) => {
            let formData = new FormData();
            if (params) {
                for (let k in params) {
                    formData.append(k, params[k]);
                }
            }
            if(this._LOG_MODE){
                this.log(params);
            }
            
            let headerObj = this.initHeader();
            let sendData = {
                method: 'DELETE',
                headers: headerObj
            };
            if(this._LOG_MODE){
                this.log(headerObj);
            }
            if(params){
                sendData['body'] = formData;
            }
            fetch(url, sendData).then(response => {
                if(response.ok){
                    return response.json()
                }
                else{
                    this.log(response);
                    if(response.status === 404){
                        this.log({message : 'Request is not found.'});
                        return reject({message : 'Request is not found.'});
                    }
                    else if(response.status === 405){
                        return reject({message : 'Method Not Allowed..'});
                    }
                    else if(response.status === 500){
                        return reject({message : 'Internal Server Error'});
                    }
                    reject({statusCode : response.status, statusText : response.statusText, message : response.statusText, url : response.url});
                }
            })
            .then(data => {
                if(this._LOG_MODE){
                    this.log(`Failed GET ${url}`);
                }
                if(this._LOG_MODE > 1){
                    this.log(data);
                }
                
                resolve(data);
            })
            .catch(err => reject(err));
        });
    }

    /**
     * Makes POST request.
     * @param {string} path API path.
     * @param {object} params Request parameters.
     * @param {string} apiHost Override current API host.
     * @param {object} options Request options.
     */
    post(path, params, apiHost = null, options = null) {
        let url = this.getApiUrl(path, apiHost);
        if(this._LOG_MODE){
            this.log('API POST ' + url);
        }
        
        return new Promise((resolve, reject) => {
            let formData = null;
            if(options && options.useUrlEncoded){
                formData = this.serialize(params);
            }
            else{
                formData = new FormData();
                if (params) {
                    for (let k in params) {
                        let v = params[k];
                        if(v instanceof Date){
                            formData.append(k, v.toJSON());
                        }
                        // if is object and not file interface then json encode
                        else if(typeof v === 'object' && !v.uri){
                            formData.append(k, JSON.stringify(v));
                        }
                        else{
                            formData.append(k, v);
                        }
                    }
                }
            }
            
            this.log(params);
            let headerObj = options && options.headers ? options.headers : this.initHeader();
            if(options && options.useUrlEncoded){
                headerObj['Content-Type'] = 'application/x-www-form-urlencoded';
            }
            let sendData = {
                method: 'POST',
                headers: headerObj
            };

             if(params){
                sendData['body'] = formData;
            }

            if(this._LOG_MODE){
                this.log(headerObj);
            }

            fetch(url, sendData)
                .then(response => {
                    if(response.ok){
                        return response.json()
                    }
                    else{
                        this.log(response);
                        if(response.status === 404){
                            return reject({message : 'Request is not found.'});
                        }
                        else if(response.status === 405){
                            return reject({message : 'Method Not Allowed..'});
                        }
                        else if(response.status === 500){
                            return reject({message : 'Internal Server Error'});
                        }
                        reject({statusCode : response.status, statusText : response.statusText, message : response.statusText, url : response.url});
                    }
                })
                .then(data => {
                    if(this._LOG_MODE){
                        this.log(`Success POST ${url}`);
                    }
                    if(this._LOG_MODE > 1){
                        this.log(data);
                    }
                    resolve(data);
                })
                .catch(error => {
                    if(this._LOG_MODE){
                        this.log('Failed POST: ' + url);
                        this.log(sendData);
                        this.log(error);
                        this.log(error.message);
                    }
                    
                    reject(error);
                });
        });
    }

    /**
     * Makes a PUT request.
     * @param {string} path API path.
     * @param {object} params Request parameters.
     * @param {string} apiHost Override current API host.
     * @param {object} options Request options.
     */
    put(path, params, apiHost = null, options = null) {
        let url = apiHost ? apiHost + path : this._API_HOST_URL + path;
        if(this._LOG_MODE){
            this.log('API PUT ' + url);
        }
        if(!options){
            options = {
                useUrlEncoded : true
            };
        }
        return new Promise((resolve, reject) => {
            let formData = null;
            if(options && options.useUrlEncoded){
                formData = this.serialize(params);
            }
            else{
                formData = new FormData();
                if (params) {
                    for (let k in params) {
                        let v = params[k];
                        if(v instanceof Date){
                            formData.append(k, v.toJSON());
                        }
                        // if is object and not file interface then json encode
                        else if(typeof v === 'object' && !v.uri){
                            formData.append(k, JSON.stringify(v));
                        }
                        else{
                            formData.append(k, v);
                        }
                    }
                }
            }
            
            this.log(params);
            let headerObj = options && options.headers ? options.headers : this.initHeader();
            if(options && options.useUrlEncoded){
                headerObj['Content-Type'] = 'application/x-www-form-urlencoded';
            }
            let sendData = {
                method: 'PUT',
                headers: headerObj
            };

             if(params){
                sendData['body'] = formData;
            }

            if(this._LOG_MODE){
                this.log(headerObj);
            }

            fetch(url, sendData)
                .then(response => {
                    if(response.ok){
                        return response.json()
                    }
                    else{
                        if(this._LOG_MODE){
                            this.log(response);
                        }
                        if(response.status === 404){
                            return reject({message : 'Request is not found.'});
                        }
                        else if(response.status === 405){
                            return reject({message : 'Method Not Allowed..'});
                        }
                        else if(response.status === 500){
                            return reject({message : 'Internal Server Error'});
                        }
                        reject({statusCode : response.status, statusText : response.statusText, message : response.statusText, url : response.url});
                    }
                })
                .then(data => {
                    if(this._LOG_MODE){
                        this.log(`Success PUT ${url}`);
                    }
                    if(this._LOG_MODE > 1){
                        this.log(data);
                    }
                    resolve(data);
                })
                .catch(error => {
                    if(this._LOG_MODE){
                        this.log('Failed PUT: ' + url);
                        this.log(sendData);
                        this.log(error);
                        this.log(error.message);
                    }
                    
                    reject(error);
                });
        });
    }

    /**
     * Uploads file to server.
     * @param {string} path API path.
     * @param {object} params Request parameters.
     * @param {func} onProgress On progress callback.
     * @param {string} apiHost Override current API host URL.
     * @param {object} options Request options
     */
    upload(path, params, onProgress, apiHost, options){
        // use XMLHttpRequest than use fetch API
        return new Promise((resolve, reject) => {
            let r = new XMLHttpRequest();

            let url = this.getApiUrl(path, apiHost);

            if(this._LOG_MODE){
                this.log('API UPLOAD ' + url);
                this.log(params);
            }

            // set form data
            let formData = null;
            formData = new FormData();
            if (params) {
                for (let k in params) {
                    let v = params[k];
                    if(v instanceof Date){
                        formData.append(k, v.toJSON());
                    }
                    // if is object and not file interface then json encode
                    else if(typeof v === 'object' && !v.uri){
                        formData.append(k, JSON.stringify(v));
                    }
                    else{
                        formData.append(k, v);
                    }
                }
            }

            let headerObj = options && options.headers ? options.headers : this.initHeader();

            if(this._LOG_MODE){
                this.log(headerObj);
            }

            // upload progress
            r.upload.onprogress=(e)=>{
                let c = e.lengthComputable?(Math.floor(e.loaded * 100/e.total)): 0;
                if(onProgress){
                    onProgress(c);
                }
            };
            // callback when load success
            r.onload=(e)=>{
                if(r.readyState == 4){
                    this.log(r.responseText);
                    if(r.status == 200){
                        try{
                            let d = JSON.parse(r.responseText);
                            resolve(d);
                        }
                        catch(err){
                            reject(err);
                        }
                    }   
                    else if(r.status == 404){
                        return reject({message : 'Request is not found.'});
                    }
                    else if(r.status == 405){
                        return reject({message : 'Method Not Allowed..'});
                    }
                    else if(r.status == 500){
                        return reject({message : 'Internal Server Error'});
                    }
                    else{
                        return reject({message : 'Unknown error!'});
                    }
                }
            };
            r.onerror = (e) => {
                this.log(e);
                reject(e);
            }
            r.open('POST',url);

            // set request headers
            if(headerObj){
                for(let k in headerObj){
                    r.setRequestHeader(k, headerObj[k]);
                }
            }

            r.send(formData);
        });
    }

    getAppLinkInfo(url) {
        return new Promise((resolve, reject) => {
            let headerObj = this.initHeader();
            headerObj['Content-Type'] = 'application/json';
            let currentRequest = 0;

            let request = (resolve, reject) => {
                fetch(url, {
                    method: 'GET',
                    headers: headerObj
                }).then(response => {
                    if(response.ok){
                        return response.json()
                    }
                    else{
                        this.log(response);
                        reject({statusCode : response.status, statusText : response.statusText, message : response.statusText, url : response.url});
                    }
                })
                .then(data => {
                    if(this._LOG_MODE){
                        this.log(`Success GET ${url}`);
                    }
                    if(this._LOG_MODE > 1){
                        this.log(data);
                    }
                    
                    resolve(data);
                })
                .catch(error => {
                    errorHandler(reject, error);
                });
            }

            let errorHandler = (reject, error) => {
                if(this._LOG_MODE){
                    this.log('API Failed GET: ' + url);
                    this.log(error);
                    this.log(error.message);
                }
                currentRequest++;
                if(currentRequest >= this._RETRY_NUMBER){
                    this.log('API reject GET: ' + url);
                    reject(error);
                }
                else{
                    this.log('API RETRY GET ' + url);
                    request(resolve, reject);
                }
            }

            request(resolve, reject);
        });
    }
}

const Api = new ApiService();
export default Api;