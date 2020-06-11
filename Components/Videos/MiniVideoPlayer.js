import React, { Component } from 'react';
import {View, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet} from 'react-native';

import Video from 'react-native-video'; 
import Image from './../Image';
import Icon from './../Icon';
import ActivityIndicator from './../ActivityIndicator';
import Api from './../../Api';

import {Log, Utils} from './../../Utils';

var ACTIVE_ITEM_ID = 0;

export default class MiniVideoPlayer extends React.PureComponent {
    constructor(props){
        super(props);

        this.state = {
            isMuted : false,
            isPlaying : this.props.autoplay !== undefined ? this.props.autoplay : false,
            isRepeated : false,
            loading : false,
            previewReady : false,
            selfCanPlay : false
        };
    }

    componentDidMount(){
        this._amount = true;

        Log('MiniVideoPlayer > componentDidMount');
    }

    componentWillUnmount(){
        this._amount = false;
    }

    componentDidUpdate = (prevProps, prevState) => {
        let {item, canPlay} = this.props;
        Log('MiniVideoPlayer > componentDidUpdate > ' + item.id + ' > ' + canPlay);
        if(canPlay && !prevProps.canPlay){
            // canPlay prop changed
            this.play();
        }
    }

    forcePlay(){
        if(!this._amount) return;
        if(this.state.previewReady) return;
        this.forceTimer = setTimeout(() => {
            if(!this.state.previewReady){
                if(!this._amount) return;
                this.setState({isPlaying : false});
                this.forceTimer = setTimeout(() => {
                    if(!this._amount) return;
                    this.setState({isPlaying : true});
                }, 100);
            }
        }, 100);
    }

    isPlaying(){
        return this.state.isPlaying && this.state.previewReady;
    }

    play(selfCanPlay){
        let {item} = this.props;
        ACTIVE_ITEM_ID = item.id;
        Log('MiniVideoPlayer > play > ' + item.id);
        if(this.state.isPlaying) return;
        let updateState = {
            isPlaying : true
        };

        if(!this.state.previewReady){
            updateState.loading = true;
        }

        if(selfCanPlay){
            updateState.selfCanPlay = true;
        }

        this.setState(updateState);
    }

    pause(){
        let {item} = this.props;
        Log('MiniVideoPlayer > pause > ' + item.id);
        if(this.forceTimer){
            clearTimeout(this.forceTimer);
            this.forceTimer = null;
        }
        if(!this.state.isPlaying && !this.state.loading) return;
        this.setState({isPlaying : false, loading : false});
    }

    toggle(){
        this.setState({isPlaying : !this.state.isPlaying});
    }

    onBuffer = (e) => {
        Log('MiniVideoPlayer > onBuffer');
        // this.setState({loading : true});
    }

    /**
     * e:  { playableDuration: 126.043, currentTime: 13.63 }
     */
    onProgress = (e) => {
        if(!this._amount) return;
        // stop if current video is not active (playing) single video can play at same time
        let {item} = this.props;
        if(ACTIVE_ITEM_ID != item.id){
            // another active video is play, stop this
            this.setState({isPlaying : false});
            return;
        }
        this.playableDuration = e.playableDuration;
        this.currentTime = e.currentTime;

        let percent = this.currentTime / item.duration * 100;

        if(item.counted) return;
        if(percent >= 50  || this.currentTime >= 60){
            item.counted = true;
            Api.post(`videos/${item.id}/count`, { current_time : this.currentTime}).then(data => {
                Log(data);
            })
            .catch(err => Log(err));
        }
    }


    onLoadStart = (e) => {
        Log('MiniVideoPlayer > onLoadStart');
        if(!this._amount) return;
        if(this.state.loading) return;
        this.setState({loading : true});
    }

    onLoad = (e) => {
        let {item} = this.props;
        Log(`MiniVideoPlayer > ${item.id} > onLoad > ${this.state.isPlaying}`);
        let {isPlaying} = this.state;
        this.setState({t : new Date(), isPlaying });

        if(this.state.isPlaying && !this.state.previewReady){
            // is playing but not ready to play, what the pho?, set timeout if after 50 milisecond not play then try pause and play
            this.forcePlay();
        }
    }

    onPlaybackStalled = (e) => {
        Log('MiniVideoPlayer > onPlaybackStalled');
    }

    onPlaybackResume = (e) => {
        Log('MiniVideoPlayer > onPlaybackResume');
    }

    onReadyForDisplay = (e) => {
        Log('MiniVideoPlayer > onReadyForDisplay');
        if(!this._amount) return;
        this.setState({loading : false, previewReady: true});
    }

    onError = (e) => {
        Log('MiniVideoPlayer > onError');
    }

    onTimedMetadata = (e) => {
        Log('MiniVideoPlayer > onTimedMetadata');
    }

    onEnd = (e) => {
        Log('MiniVideoPlayer > onEnd');
        this._amount && this.setState({isPlaying : false});
        this._amount && this.props.onEnd && this.props.onEnd(this.props.item);
    }

    _play = () => {
        this.play(true);
    }

    _pause = () =>{
        this.pause();
    }

    render() {
        let {item} = this.props;

        let canPlay = this.props.canPlay || this.state.selfCanPlay;
        Log('MiniVideoPlayer > render > ' + item.id + ' >  canPlay > ' + canPlay);

        let ratio = 16/9;
        if(item.is_square){
            ratio = 1;
        }
        else if(item.video_ratio){
            let t = parseFloat(item.video_ratio);
            if(t){
                ratio = t;
            }
        }
        
        return (
            <View style={{
                width : '100%',
                aspectRatio :  ratio,
                backgroundColor : '#000000',
                justifyContent : 'center',
                alignContent : 'center',
                alignItems : 'center',
            }}>
                {canPlay ? <Video 
                    source={{uri : item.video_url}} 
                    ref={(ref) => {
                        this.player = ref
                    }} 
                    rate={1.0}                  
                    volume={1.0}                
                    muted={this.state.isMuted}        
                    paused={!this.state.isPlaying}              
                    resizeMode="contain"        
                    repeat={this.state.isRepeated}               
                    onLoadStart={this.onLoadStart}
                    onLoad={this.onLoad}       
                    onError={this.videoError} 
                    onTimedMetadata={this.onTimedMetadata}
                    onReadyForDisplay={this.onReadyForDisplay}
                    onPlaybackStalled={this.onPlaybackStalled}
                    onProgress={this.onProgress}
                    onPlaybackResume={this.onPlaybackResume}
                    onBuffer={this.onBuffer}
                    onEnd={this.onEnd}  
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom : 0, 
                        right: 0
                    }}
                /> : null}

                {!this.state.previewReady ? <Image source={{uri : Api.getImage(item.thumbnail_500 || item.image || item.thumbnail_320)}} resizeMode='cover' style={{
                    position : 'absolute',
                    top: 0,
                    left : 0,
                    bottom : 0,
                    right : 0
                }} /> : null}

                {!this.state.isPlaying ? <Text style={styles.duration}>{Utils.formatDuration(item.duration)}</Text> : null}

                {this.state.loading && canPlay ? <ActivityIndicator size='large' color='#ffffff' /> : null}

                {!this.state.isPlaying && !this.state.loading  ? 
                <TouchableOpacity onPress={this._play}>
                    <Icon type='SimpleLineIcons' size={96} color='#ffffff' name='social-youtube' style={{
                        backgroundColor : 'transparent',
                        opacity: 0.3
                    }} />
                </TouchableOpacity> : null}

                {this.state.isPlaying || this.state.loading ? <TouchableWithoutFeedback onPress={this._pause}><View style={{
                    position : 'absolute',
                    top: 0,
                    left : 0,
                    bottom : 0,
                    right : 0
                }} /></TouchableWithoutFeedback> : null}
            </View>
        )
    }
}

var styles = StyleSheet.create({
    duration : {
        position: 'absolute',
        bottom : 8,
        right: 8,
        backgroundColor : 'rgba(0, 0, 0, 0.8)',
        color : '#fff',
        paddingLeft : 4, 
        paddingRight : 4,
        paddingTop: 1,
        paddingBottom: 1,
        borderRadius : 2,
        fontSize : 12
    },
});