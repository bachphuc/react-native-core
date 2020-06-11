import React, { Component } from 'react';
import { Platform as PlatformNative, Dimensions} from 'react-native';

var instance;

class PlatformHandler{
    constructor() {
        this.OS = PlatformNative.OS;
    }

    static getInstance() {
        if (instance) return instance;
        instance = new PlatformHandler();
        return instance;
    }

    isAndroid(){
        return this.OS === 'android' ? true : false;
    }

    isIos(){
        return this.OS === 'ios' ? true : false;
    }

    isIphoneX(){
        let d = Dimensions.get('window');
        const { height, width } = d;

        return (
            // This has to be iOS duh
            PlatformNative.OS === 'ios' &&

            // Accounting for the height in either orientation
            (height === 812 || width === 812)
        );
    }
}

let Platform = PlatformHandler.getInstance();
export default Platform;