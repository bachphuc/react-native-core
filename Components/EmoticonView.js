import React, {Component} from 'react';

import {View, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';

import WebImage from 'react-native-awesome-image';
import Icon from './Icon';
import Config from 'app/Config';
import { Log } from './../Utils';

const EMOTICON_HOST = Config.SOCKET_URL;

export default class EmoticonView extends React.PureComponent{
    constructor(props){
        super(props);
        
        let autoplay = false;
        if(props.emoticon){
            this.emoticon = props.emoticon;
        }
        else if(props.message){
            let message = props.message;
            let emo = {};
            for(let k in message){
                if(k.indexOf('emoticon') != -1){
                    let ek = k.replace('emoticon_', '');
                    emo[ek] = message[k];
                }
            }
            if(message.emoticon_autoplay){
                autoplay = true;
            }
            this.emoticon = emo;
        }

        this.state = {
            currentFrame : 0,
            bNeedStop : false,
            bPlaying : false,
            totalRepeat : 3,
            currentPlayed : 0,
            left : 0,
            top : 0,
            autoplay : autoplay,
            isReady : false
        };
    }

    componentDidMount = () => {
        this._isMounted = true;
        setTimeout(() => {
            if(this._isMounted){
                this.setState({loaded : true});
            }
        }, 500);
    }

    componentWillUnmount = () => {
        this._isMounted = false;
        if(this.timer){
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    play =() =>{
        if(!this._isMounted) return;
        if(!this.emoticon) return;
        if(this.state.bPlaying) return;
        let newState = {};
        if (!this.state.bPlaying) {
            newState.currentPlayed = 0;
        }
        newState.bPlaying = true;
        this.setState(newState);
        this.timer = setInterval(this.updateFrame, parseInt(1000 / this.emoticon.total_frame));
    }

    clearTimer(){
        if(this.timer){
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateFrame = () =>{
        if(!this._isMounted) {
            this.clearTimer();
            return;
        }
        if (this.state.currentPlayed >= this.state.totalRepeat || (!this.state.currentFrame && this.state.bNeedStop)) {
            return this.stop();
        }

        let newState = {};

        let row = parseInt(this.state.currentFrame / this.emoticon.column_count);
        let col = this.state.currentFrame % this.emoticon.column_count;

        newState.left = (-1 * col * this.emoticon.frame_width);
        newState.top = (-1 * row * this.emoticon.frame_height);

        newState.currentFrame = this.state.currentFrame + 1;
        if (newState.currentFrame >= this.emoticon.total_frame) {
            newState.currentFrame = 0;
            newState.currentPlayed = this.state.currentPlayed + 1;
        }

        this.setState(newState);
    }

    stop() {
        if(!this.emoticon) return;
        let newState = {};
        if (this.state.currentFrame) {
            newState.bNeedStop = true;
        }
        else{
            if (this.timer) {
                newState.bNeedStop = false;
                newState.bPlaying = false;
                newState.currentPlayed = 0;
                newState.left = 0;
                newState.top = 0;
                clearInterval(this.timer);
                this.timer = null;
            }
        }
        this.setState(newState);
    }

    onLoadImageSuccess = (event) => {
        if(!this._isMounted) return;
        Log(`EmoticonView > onLoadImageSuccess`);
        if(this.state.isReady) return;
        if(this.props && this.props.autoplay || this.state.autoplay){
            this.state.isReady = true;
            this.play();
        }
        else{
            this.setState({isReady : true});
        }
    }

    render(){
        if(!this.emoticon) return null;
        return (
            <TouchableWithoutFeedback onPress={this.play}>
                <View style={{
                    width : this.emoticon.frame_width,
                    height : this.emoticon.frame_height,
                    overflow : 'hidden',
                    backgroundColor : '#ffffff',
                    justifyContent : 'center',
                    alignContent : 'center',
                    alignItems : 'center',
                    borderRadius : 4,
                }}> 
                    {!this.state.isReady && this.state.loaded ? 
                        <Icon type="MaterialCommunityIcons" name="emoticon-happy" size={96} color='#cccccc' />
                    : null}
                    <WebImage style={{
                        position : 'absolute',
                        width : this.emoticon.src_width,
                        height : this.emoticon.src_height,
                        left : this.state.left,
                        top : this.state.top
                    }} source={{uri : EMOTICON_HOST + this.emoticon.src }} onLoad={this.onLoadImageSuccess} />
                </View>
            </TouchableWithoutFeedback>
        );
    }
}