import React, { Component } from 'react';
import { Text, View} from 'react-native';
import {Log} from './../Utils';
import lang from './../lang';
import Icon from './Icon';
import NetInfoNative from '@react-native-community/netinfo';


var instance;

class NetInfoHandler{
    constructor() {
        this.bHasNetwork = undefined;
        this.connectionType = '';
        this.effectiveType = '';
        this.networkChangeCallbacks = [];
        this.networkReadyCallback = null;
    }

    init(){
        // add event listener
        NetInfoNative.addEventListener(this.handleConnectedChanged)

        // check network at first time
        this.checkNetwork();
    }

    handleConnectedChanged = (state) => {
        this.connectionType = state.type;
        let bOldHasNetwork = this.bHasNetwork;
        this.bHasNetwork = state.isConnected;
        if(bOldHasNetwork != state.isConnected){
            this.fireOnNetworkChanged();
        }
    }

    checkNetwork(){
        NetInfoNative.fetch().then((state) => {
            this.handleFirstConnectivityChange(state);
            if(this.networkReadyCallback){
                this.networkReadyCallback(this.bHasNetwork);
            }
        })
    }

    onNetworkReady(callback){
        this.networkReadyCallback = callback;
    }

    addEventListener(event, callback){
        this.onNetworkChanged(callback);
    }

    removeEventListener(event, callback){
        this.removeOnNetworkChange(callback);
    }

    onNetworkChanged(callback){
        let index = this.networkChangeCallbacks.indexOf(callback);
        if(index === -1){
            this.networkChangeCallbacks.push(callback);
        }
    }

    removeOnNetworkChange(callback){
        let index = this.networkChangeCallbacks.indexOf(callback);
        if(index === -1) return false;
        this.networkChangeCallbacks.splice(index, 1);
    }

    fireOnNetworkChanged(){
        if(!this.networkChangeCallbacks || !this.networkChangeCallbacks.length) return;
        this.networkChangeCallbacks.forEach(c => {
            if(c){
                c(this.bHasNetwork);
            }
        });
    }

    handleFirstConnectivityChange = (state) => {
        Log('NetInfo > New network info, type: ' + state.type + ', connected: ' + state.connected);
        let bOldHasNetwork = this.bHasNetwork;
        this.connectionType = state.type;
        if(this.connectionType === 'none'){
            this.bHasNetwork = false;
        }
        if(this.bHasNetwork != bOldHasNetwork){
            this.fireOnNetworkChanged();
        }
    }

    hasNetwork(){
        return this.bHasNetwork;
    }

    getConnectionInfo(){
        return new Promise((resolve, reject) => {
            NetInfoNative.fetch().then((state) => {
                this.handleFirstConnectivityChange(state);
                resolve(state);
            })
            .catch(error => reject(error));
        });
    }

    static getInstance() {
        if (instance) return instance;
        instance = new NetInfoHandler();
        return instance;
    }
}

export class NetInfoBar extends Component{
    constructor(props){
        super(props);
        this.state = {
            bHasNetwork : NetInfo.hasNetwork()
        };
    }
    componentDidMount = () => {
        this._amount = true;
        NetInfo.onNetworkChanged(b => {
            if(!this._amount) return;
            this.setState({bHasNetwork : b});
        });
    }

    componentWillUnmount(){
        this._amount = false;
    }

    render(){
        if(NetInfo.hasNetwork() || NetInfo.hasNetwork() === undefined) return null;
        return (
            <View style={{
                height : 50,
                alignItems : 'center',
                flexDirection : 'row',
                justifyContent : 'center',
                alignContent : 'center',
                backgroundColor : '#444444'
            }}>
                <Icon type='MaterialCommunityIcons' name='wifi-off' size={24} color='#fff'/>
                <Text style={{
                    marginLeft : 8,
                    color : '#fff'
                }}>{lang('no_network_connected')}</Text>
            </View>
        );
    }
}

let NetInfo = NetInfoHandler.getInstance();
export default NetInfo;