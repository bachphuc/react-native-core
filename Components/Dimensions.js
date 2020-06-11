import React, { Component } from 'react';
import { Dimensions as DimensionsNative, StatusBar} from 'react-native';

import Orientation from 'react-native-orientation';
import {Log} from './../Utils';
import Platform from './Platform';

var instance;

class DimensionsHandler{
    constructor() {
        this.currentOrientation = '';
        this.sizes = {
        };
        this.sameMaps = {
            PORTRAIT : 'PORTRAITUPSIDEDOWN',
            PORTRAITUPSIDEDOWN : 'PORTRAIT',
            LANDSCAPE : 'LANDSCAPE'
        };
        this.oppositeMaps = {
            PORTRAIT : 'LANDSCAPE',
            LANDSCAPE : 'PORTRAIT'
        };
        this.sizeChangeCallbacks = [];

        this.init();
    }

    static getInstance() {
        if (instance) return instance;
        instance = new DimensionsHandler();
        return instance;
    }

    onSizeChange(callback){
        this.sizeChangeCallbacks.push(callback);
    }

    removeOnSizeChange(callback){
        if(this.sizeChangeCallbacks && this.sizeChangeCallbacks.length){
            let index = this.sizeChangeCallbacks.indexOf(callback);
            if(index != -1){
                this.sizeChangeCallbacks.splice(index, 1);
            }
        }
    }

    fireSizeChangeCallback(){
        if(this.sizeChangeCallbacks && this.sizeChangeCallbacks.length){
            this.sizeChangeCallbacks.forEach(c => {
                if(c){
                    c({
                        width : this.width,
                        height : this.height
                    });
                }
            })
        }
    }

    init(){
        let { width, height } = DimensionsNative.get('window');
        this.width = width;
        this.height = height;

        const initial = Orientation.getInitialOrientation();
        this.currentOrientation = initial;
        Log('Dimensions > init > ' + initial);
        this.sizes[initial] = {
            width : width,
            height : height
        };
        this.log();

        Orientation.addOrientationListener(this._orientationDidChange);
    }

    log = () => {
        Log(`Dimensions Orientation: ${this.currentOrientation}, width: ${this.width}, height: ${this.height}`);
        this.updateConstants();
    }

    updateConstants(){
        if(Platform.OS == 'android'){
            this.STATUS_BAR_HEIGHT = StatusBar.currentHeight;
            this.TOP = 0;
        }
        else{
            if(this.currentOrientation == 'LANDSCAPE'){
                this.STATUS_BAR_HEIGHT = 0;
                this.TOP = 0;
            }
            else{
                if(Platform.isIphoneX()){
                    this.STATUS_BAR_HEIGHT = 44;
                    this.TOP = 44;
                }
                else{
                    this.STATUS_BAR_HEIGHT = 20;
                    this.TOP = 20;
                }
            }
        }

        this.BOTTOM_PADDING_HEIGHT = Platform.OS == 'android' ? 0 : (Platform.isIphoneX() ? 34 : 0);
        this.CONTENT_HEIGHT = this.height - this.STATUS_BAR_HEIGHT - this.BOTTOM_PADDING_HEIGHT;
    }

    _orientationDidChange = (orientation) => {
        Log('Dimensions _orientationDidChange: ' + orientation);
        this.currentOrientation = orientation;
        if(this.sizes[orientation]){
            let size = this.sizes[orientation];
            this.width = size.width;
            this.height = size.height;
            this.log();
            this.fireSizeChangeCallback();
            return;
        }

        // check map same
        if(this.sameMaps[orientation]){
            let sameOrientation = this.sameMaps[orientation];
            if(this.sizes[sameOrientation]){
                let size = this.sizes[sameOrientation];
                this.width = size.width;
                this.height = size.height;
                this.log();
                this.fireSizeChangeCallback();
                return;
            }
        }
        // check opposite map
        if(this.oppositeMaps[orientation]){
            let oppositeOrientation = this.oppositeMaps[orientation];
            if(this.sizes[oppositeOrientation]){
                let size = this.sizes[oppositeOrientation];
                this.width = size.height;
                this.height = size.width;
                this.log();
                this.fireSizeChangeCallback();
                return;
            }
        }
        this.log();
        this.fireSizeChangeCallback();
    }
    /**
     * make this Compatible with Dimensions Native
     */
    get(type){
        return this;
    }
}

let Dimensions = DimensionsHandler.getInstance();
export default Dimensions;