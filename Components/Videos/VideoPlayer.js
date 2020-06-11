import React, {Component} from 'react';
import {Text, View, ActivityIndicator, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, StatusBar, BackHandler, Slider, Share} from 'react-native';
import Video from 'react-native-video'; 
import Spinner from 'react-native-spinkit';

import {Log, Utils} from './../../Utils';
import Icon from './../Icon';
import Image from './../Image';
import { Actions } from 'react-native-router-flux';
import Api from './../../Api';
import Platform from './../Platform';

export default class VideoPlayer extends Component{
    constructor(props){
        super(props);
        this.state = {
            loading : true,
            isPlaying : true,
            isMuted : false,
            isRepeated : false,
            isEnded : false
        };

        this.counted = {};
        
        if(this.props.seekTime){
            this.seekTime = this.props.seekTime;
        }

        if(props && props.playlist){
            this.playlist = props.playlist;
        }
        else{
            this.playlist = [];
        }

        if(props && props.item){
            this.item = props.item;
            let index = this.indexOf(this.item);
            this.currentIndex = index !== -1 ? index : 0;
            if(!this.playlist.length){
                this.playlist.push(this.item);
            }
        }
        else{
            if(this.playlist.length){
                this.currentIndex = 0;
                this.item = this.playlist[this.currentIndex];
            }
        }
    }

    indexOf(item){
        if(!item) return -1;
        if(!this.playlist || !this.playlist.length) return -1;
        for(let i = 0; i < this.playlist.length ; i++){
            if(item.id == this.playlist[i].id) return i;
        }
        return -1;
    }

    componentDidMount = () => {
        this._amount = true;
        if(this.props.fullscreen){
            StatusBar.setHidden(true);
        }
        BackHandler.addEventListener('hardwareBackPress', this.hardwareBackPress);
    }

    componentWillUnmount = () => {
        this._amount = false;
        if(this.props.fullscreen){
            StatusBar.setHidden(false);
        }

        BackHandler.removeEventListener('hardwareBackPress', this.hardwareBackPress);
    }

    hardwareBackPress = () => {
        // this.onMainScreen and this.goBack are just examples, you need to use your own implementation here
        // Typically you would use the navigator here to go to the last state.
        if(this.props && this.props.fullscreen){
            this.onExitFullScreen();
            return true;
        }
        
        return false;
    }

    processItem(item){
        Log('VideoPlayer > processItem');
        if(!item) return;
        let index = this.indexOf(item);
        // if this item is ready in playlist
        if(index !== -1){
            this.currentIndex = index;
            this.item = item;
        }
        else{
            // this's item is not in playlist
            // append this item to last playlist
            this.playlist.push(item);
            this.currentIndex = this.playlist.length - 1;
            this.item = item;
        }
    }

    addItems(items){
        if(!items || !items.length) return;
        Log('VideoPlayer addItems ' + items.length);
        items.forEach(item => {
            let index = this.indexOf(item);
            if(index === -1){
                this.playlist.push(item);
            }
        });
        this.setState({forceRender : true});
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(!this._amount) return;

        if(nextProps.item.id != this.props.item.id){
            // this.processItem(nextProps.item);
            // this.seek(0);
            this.playVideo(nextProps.item);
            return true;
        }
        if(this.props.fullscreen != nextProps.fullscreen){
            return true;
        }
        if(this.state.loading != nextState.loading){
            return true;
        }
        if(this.state.isPlaying != nextState.isPlaying){
            return true;
        }
        if(this.state.isMuted != nextState.isMuted){
            return true;
        }
        if(this.state.hideControl != nextState.hideControl){
            return true;
        }
        if(this.state.isEnded != nextState.isEnded){
            return true;
        }

        if(this.state.percent != nextState.percent){
            return true;
        }

        if(nextState.forceRender === true) {
            return true;
        }
        
        return false;
    }

    UNSAFE_componentWillReceiveProps = (nextProps) => {
        // check if item change then update
        // if((!this.item && nextProps.item) || (nextProps.item && nextProps.item.id != this.item.id)){
        //     Log('VideoPlayer > update item');
        //     this.setState({loading : true, isPlaying : true, isEnded : false});
        // }
    }

    onLoadStart = () => {
        Log('VideoPlayer > onLoadStart');
        if(!this.state.loading){
            this.setState({loading : true, isPlaying : true, isEnded : false});
        }
    }

    onLoad = () => {
        Log('VideoPlayer > onLoad');
        if(this.seekTime){
            Log('VideoPlayer > onLoad > seekTime > ' + this.seekTime);
            this.player.seek(this.seekTime);
            this.seekTime = 0;
        }
    }

    onEnd = () => {
        Log('VideoPlayer > onEnd');
        if(!this._amount) return;
        this.setState({isEnded : true, isPlaying : false, hideControl : false});
    }

    videoError = () => {
        Log('VideoPlayer > videoError');
    }

    onBuffer = () => {
        Log('VideoPlayer > onBuffer');
    }   

    onTimedMetadata = (e) => {
        Log('VideoPlayer> onTimedMetadata');
        Log(e);
    }

    onReadyForDisplay = () => {
        Log('VideoPlayer > onReadyForDisplay');
        // hide loading
        this.hideLoading();
        // hide control bar after 3 seconds
        setTimeout(() => {
            this.hideControls();
        }, 4000);
    }

    hideLoading = () => {
        if(!this._amount) return;
        this.setState({loading : false});
    }

    hideControls = () => {
        Log('VideoPlayer > hideControls');
        if(!this._amount) return;
        if(this.state.hideControl) return;
        this.setState({hideControl : true});
    }

    showControls = () => {
        if(!this._amount) return;
        if(!this.state.hideControl) return;
        this.setState({hideControl : false});
        if(this.hideControlTimer){
            clearTimeout(this.hideControlTimer);
        }
        this.hideControlTimer = setTimeout(() => {
            this.hideControls();
        }, 4000);
    }

    togglePlay = () => {
        if(!this._amount) return;
        Log('VideoPlayer > togglePlay > ' + this.state.loading);

        let update = {isPlaying : !this.state.isPlaying, isEnded : false };
        if(this.state.isPlaying){
            update.hideControl = false;
        }
        // stop timer hide controls bar
        if(this.hideControlTimer){
            clearTimeout(this.hideControlTimer);
            this.hideControlTimer = null;
        }
        this.setState(update);
    }

    pause = () => {
        if(!this._amount) return;
        Log('VideoPlayer > pause');
        if(this.state.loading) return;
        // stop timer hide controls bar
        if(this.hideControlTimer){
            clearTimeout(this.hideControlTimer);
            this.hideControlTimer = null;
        }
        this.setState({isPlaying : false, hideControl : false});
    }

    play = () => {
        if(!this._amount) return;
        Log('VideoPlayer > play');
        
        this.setState({isPlaying : true, isEnded : false});
    }

    replay = () => {
        if(!this._amount) return;
        Log('VideoPlayer > replay');
        this.seek(0);
        this.setState({isPlaying : true, isEnded : false});
    }

    toggleMuted = () => {
        if(!this._amount) return;
        this.setState({isMuted : !this.state.isMuted});
    }

    callback = (data) => {
        if(!this._amount) return;
        if(this.player && data && data.currentTime){
            this.currentTime = data.currentTime;
            this.player.seek(data.currentTime);
        }
    }

    onToggleFullscreen = () => {
        if(!this._amount) return;
        if(!this.player) return;
        Log('VideoPlayer > onToggleFullscreen');
        
        if(!this.props.fullscreen){
            // this only work for ios
            // this.player.presentFullscreenPlayer();
            if(this.props.onFullscreen){
                let result = this.props.onFullscreen();
                if(result === false) return;
            }
            this.setState({isPlaying : false});
            Actions.VideoPlayerScreen({
                item : this.item,
                seekTime : this.currentTime, 
                callback : this.callback,
                item : this.props.item
            });
        }
        else{
            this.onExitFullScreen();
        }
    }

    onExitFullScreen = () => {
        if(this.props.onExitFullScreen){
            this.props.onExitFullScreen({
                currentTime : this.getCurrentTime()
            });
        }
    }

    /**
     * e:  { playableDuration: 126.043, currentTime: 13.63 }
     */
    onProgress = (e) => {
        this.playableDuration = e.playableDuration;
        this.currentTime = e.currentTime;

        let item = this.item;
        let percent = this.currentTime / item.duration * 100;

        this.setState({percent : percent});

        if(item.counted) return;
        if(this.counted[item.id]) return;
        if(percent >= 50 || this.currentTime >= 60){
            Log('VideoPlayer > onProgress > count');
            item.counted = true;
            this.counted[item.id] = true;
            Api.post(`videos/${item.id}/count`, { current_time : this.currentTime}).then(data => {
                Log(data);
            })
            .catch(err => Log(err));
        }
    }

    seek = (value) => {
        if(!this._amount) return;
        this.currentTime = value;
        if(this.player){
            this.player.seek(value);
        }
    }

    onSlidingComplete = (value) => {
        this.isDraggingSlider = false;
        if(!this._amount) return;
        if(!this.player) return;
        let item = this.item;
        let time = item.duration * value / 100;
        this.player.seek(time);
    }

    onValueChange = (event) => {
        this.isDraggingSlider = true;
    }
    getCurrentTime(){
        return this.currentTime || 0;
    }

    shareVideo = () => {
        let item = this.item;
        let shareData = {
            message: `Cười Bá Cháy - ${item.description} - ${item.url}`,
            url: item.url,
            title: 'Cười Bá Cháy - ' + item.title
        };
        Share.share(shareData, {
            dialogTitle: 'Share this Video'
        })
    }

    canPrev = () => {
        if(!this.playlist || !this.playlist.length || this.playlist.length == 1) return false;
        let newIndex = this.currentIndex - 1;
        if(this.playlist[newIndex]){
            return true;
        }
        return false;
    }

    canNext = () => {
        if(!this.playlist || !this.playlist.length || this.playlist.length == 1) return false;
        let newIndex = this.currentIndex + 1;
        if(this.playlist[newIndex]){
            return true;
        }
        return false;
    }

    getPoster(item){
        return Api.getImage(item.thumbnail_320 || item.image);
    }

    getPreVideo(){
        if(!this.canPrev()) return false;
        return this.playlist[this.currentIndex - 1];
    }

    getPreVideoPoster(){
        let video = this.getPreVideo();
        if(!video) return false;
        return this.getPoster(video);
    }

    getNextVideo(){
        if(!this.canNext()) return false;
        return this.playlist[this.currentIndex + 1];
    }

    getNextVideoPoster(){
        let video = this.getNextVideo();
        if(!video) return false;
        return this.getPoster(video);
    }

    playVideo(item){
        Log('VideoPlayer > playVideo');
        if(!item) return;
        if(this.item && this.item.id == item.id) {
            Log('VideoPlayer > playVideo > playing id: ' + item.id);
            return;
        }
        this.seek(0);
        let index = this.indexOf(item);
        // if this item is ready in playlist
        if(index !== -1){
            this.currentIndex = index;
            this.item = item;
        }
        else{
            // this's item is not in playlist
            // append this item to last playlist
            this.playlist.push(item);
            this.currentIndex = this.playlist.length - 1;
            this.item = item;
        }
        
        if(this.props.onPlayChanged){
            this.props.onPlayChanged(this.item, this.currentIndex);
        }

        this.setState({loading : true, isPlaying : true, isEnded : false});
    }

    next = () => {
        if(!this.canNext()) return false;
        let item = this.getNextVideo();
        this.playVideo(item);
    }

    prev = () => {
        if(!this.canPrev()) return false;
        let item = this.getPreVideo();
        this.playVideo(item);
    }

    render(){
        let item = this.item;
        this.state.forceRender = false;
        // Log('VideoPlayer > render > playlist: ' + this.playlist.length + ', currentIndex: ' + this.currentIndex + ' > canNext: ' + this.canNext() + ', canPrev: ' + this.canPrev());
        return (
            <View style={[{
                backgroundColor : '#000',
                justifyContent : 'center',
                alignItems : 'center',
            }, !this.props.fullscreen ? {
                aspectRatio : 16/9
            } : {
                flex : 1
            } ]}>
                {item ?
                <Video 
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
                    onEnd={this.onEnd}  
                    onError={this.videoError} 
                    onBuffer={this.onBuffer}
                    onTimedMetadata={this.onTimedMetadata}
                    onReadyForDisplay={this.onReadyForDisplay}
                    onProgress={this.onProgress}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom : 0, 
                        right: 0
                    }}
                /> : null}
                
                {item && this.state.loading ? <Image source={{uri : this.getPoster(item)}} style={styles.poster} resizeMode='contain' /> : null}

                {this.state.loading ? <Spinner type='ThreeBounce' color='#ffffff' />  : null}

                {this.state.isEnded ? <TouchableOpacity onPress={this.replay}>
                    <Icon name='replay' size={64} color='#ffffff' style={{
                        backgroundColor : 'transparent'
                    }} />
                </TouchableOpacity> : null}

                {!this.state.loading && !this.state.isEnded ?
                <TouchableOpacity onPress={this.togglePlay} >
                    <View style={[styles.controlButton, {
                        opacity : this.state.hideControl ? 0 : 1
                    }]}>
                        <Icon type='MaterialIcons' 
                            name={this.state.isPlaying ? 'pause' : 'play-arrow'}
                            size={48} 
                            color='#ffffff'
                        />
                    </View>
                </TouchableOpacity> : null}
                
                {this.canPrev() && (this.state.isEnded || (!this.state.loading && !this.state.isPlaying) ) ? 
                <TouchableOpacity style={[styles.thumbnailVideo, styles.prevVideo]} onPress={this.prev}>
                    <Image resizeMode='cover' source={{uri : this.getPreVideoPoster()}} style={styles.thumbnailImage} />
                    <Icon name='skip-previous' size={48} color='#ffffff' style={{
                        backgroundColor : 'transparent'
                    }} />
                </TouchableOpacity> : null}
                
                {this.canNext() && (this.state.isEnded || (!this.state.loading && !this.state.isPlaying) ) ?
                <TouchableOpacity style={[styles.thumbnailVideo, styles.nextVideo]} onPress={this.next}>
                    <Image resizeMode='cover' source={{uri : this.getNextVideoPoster()}} style={styles.thumbnailImage} />
                    <Icon name='skip-next' size={48} color='#ffffff' style={{
                        backgroundColor : 'transparent'
                    }} />
                </TouchableOpacity> : null}
                
                <View style={[styles.controlBarTop, {
                    opacity : this.state.hideControl ? 0 : 1,
                    top : 0
                }]}>
                    <View style={{
                        backgroundColor : 'transparent',
                        flex : 1,
                    }}>
                        {this.props.fullscreen && item && item.title ? <Text style={{
                            backgroundColor : 'transparent'
                        }} numberOfLines={1} style={styles.videoTitle}>{item.title}</Text> : null}
                    </View>

                    <View>
                        <TouchableOpacity onPress={this.shareVideo}>
                            <View style={[styles.controlButton, {
                                opacity : this.state.hideControl ? 0 : 1
                            }]}>
                                <Icon type='Ionicons' 
                                    name='ios-share-alt'
                                    size={24} 
                                    color='#ffffff'
                                />
                            </View>
                        </TouchableOpacity>

                        {this.props.fullscreen && this.props.showCloseButton ?
                        <TouchableOpacity onPress={this.onExitFullScreen}>
                            <View style={[styles.controlButton, {
                                opacity : this.state.hideControl ? 0 : 1
                            }]}>
                                <Icon type='MaterialIcons' 
                                    name='close'
                                    size={24} 
                                    color='#ffffff'
                                />
                            </View>
                        </TouchableOpacity> : null}
                    </View>
                </View>
                <View style={[styles.controlBar, {
                    opacity : this.state.hideControl ? 0 : 1,
                    bottom: 28,
                }]}>
                    <View style={[styles.controlButton, {
                        marginLeft : 8
                    }]}>
                        <Text style={{
                            color : '#ffffff'
                        }}>{Utils.formatDuration(this.currentTime)}</Text>
                    </View>
                    <View style={{
                        flex : 1
                    }}>
                    </View>
                    <View style={{
                        flexDirection : 'row'
                    }}>
                        <View style={styles.controlButton}>
                            <Text style={{
                                color : '#ffffff'
                            }}>{Utils.formatDuration(item.duration)}</Text>
                        </View>
                        {this.props.showVolumnButton ? <TouchableOpacity onPress={this.toggleMuted} >
                            <View style={styles.controlButton}>
                                <Icon
                                    type='MaterialIcons'
                                    name={this.state.isMuted ? 'volume-off' : 'volume-up'}
                                    size={24}
                                    color='#ffffff'
                                />
                            </View>
                        </TouchableOpacity> : null}

                        <TouchableOpacity onPress={this.onToggleFullscreen} >
                            <View style={styles.controlButton}>
                                <Icon
                                    type='MaterialIcons'
                                    name={this.props.fullscreen ? 'fullscreen-exit' : 'fullscreen'}
                                    size={24}
                                    color='#ffffff'
                                />
                            </View>
                        </TouchableOpacity>
                    </View>

                </View>
                
                <View style={[styles.progressBar, {
                    opacity : this.state.hideControl ? 0 : 1,
                    bottom : 4,
                }]}>
                    <Slider style={{
                        flex : 1,
                    }} 
                        minimumTrackTintColor='red'
                        maximumTrackTintColor='#ffffff'
                        thumbTintColor='red'
                        maximumValue={100}
                        minimumValue={0}
                        value={this.state.percent}
                        onSlidingComplete={this.onSlidingComplete}
                        onValueChange={this.onValueChange}
                    />
                </View>
                
                
                {this.state.hideControl ? <TouchableWithoutFeedback onPress={this.showControls} style={[styles.overlay]}><View style={styles.overlay} /></TouchableWithoutFeedback>   : null}
            </View>
        );
    }
}

var styles = StyleSheet.create({
    controlButton : {
        alignItems : 'center',
        justifyContent : 'center',
        alignContent : 'center',
        minWidth : 40,
        height : 48,
        backgroundColor : 'transparent'
    },
    poster : {
        position: 'absolute',
        top: 0,
        left: 0,
        right : 0,
        bottom : 0
    },
    overlay : {
        position: 'absolute',
        top: 0,
        left : 0,
        right: 0,
        bottom : 0
    },
    controlBar : {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 48,
        flexDirection : 'row'
    },
    controlBarTop : {
        position : 'absolute',
        left : 0,
        right : 0,
        flexDirection : 'row'
    },
    progressBar : {
        position: 'absolute',
        left : Platform.OS == 'ios' ? 0 : -4,
        right : Platform.OS == 'ios' ? 0 : -4,
    },
    thumbnailVideo : {
        width : 72,
        height : 72,
        position : 'absolute',
        top : '50%',
        backgroundColor : '#ffffff',
        opacity : 0.8,
        marginTop : -36,
        borderRadius : 4,
        justifyContent : 'center',
        alignContent : 'center',
        alignItems : 'center'
    },
    prevVideo : {
        left : 16,
    },
    nextVideo : {
        right : 16
    },
    thumbnailImage : {
        position : 'absolute',
        top : 0, 
        right : 0,
        bottom : 0,
        left : 0,
        borderRadius : 4
    },
    videoTitle : {
        color : '#ffffff',
        fontSize : 16,
        padding : 12
    }
});