import React, { Component } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Slider, ScrollView, RefreshControl} from 'react-native';

import Video from 'react-native-video'; 
import Image from './../Image';
import BlurImage from './../BlurImage';
import Icon from './../Icon';
import Dimensions from './../Dimensions';
import {Log} from './../../Utils';
import Gate from './../../Gate';
import Toast from './../Toast';
import ActivityIndicator from './../ActivityIndicator';
import TouchableNativeFeedback from './../TouchableNativeFeedback';

import LinearGradient from 'react-native-linear-gradient';

import Interactable from 'react-native-interactable';

var ImageAnimated = Animated.createAnimatedComponent(Image);
const LinearGradientAnimated = Animated.createAnimatedComponent(LinearGradient);

import SvgSlider from './../../Svg/SvgSlider';

export class DiskCD extends Component{
    constructor(props){
        super(props);
        this.state = {
            rotateAnim : new Animated.Value(0)
        };
    }

    componentDidMount = () => {
        this._amount = true;
        if(this.props.isPlaying){
            this.startAnimation();
        }
    }

    componentWillUnmount = () => {
        this._amount = false;
        if(this.rotateAnim){
            this.rotateAnim.stop();
            this.rotateAnim = null;
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.isPlaying != nextProps.isPlaying) {
            if(!this.props.isPlaying && nextProps.isPlaying){
                this.startAnimation();
            }
            return true;
        }
        if(!this.props.audio && nextProps.audio) return true;
        if(this.props.audio && nextProps.audio && this.props.audio.location != nextProps.audio.location){
            return true;
        }
        return false;
    }

    startAnimation(){
        if(!this._amount) return;
        if(this.isRotated) return;
        this.isRotated = true;
        this.rotateAnim = Animated.sequence([
            Animated.timing(this.state.rotateAnim, {
                toValue : 1,
                duration : 2000,
                useNativeDriver : true
            }),
            Animated.timing(this.state.rotateAnim, {
                toValue : 0,
                duration : 0,
                useNativeDriver : true
            })
        ])
        .start(() => { 
            this.isRotated = false;
            if(this.props.isPlaying){
                this.startAnimation();
            }
        });
    }

    render(){
        let {audio} = this.props;
        console.log(audio);
        let spin = this.state.rotateAnim.interpolate({
            inputRange : [0, 1],
            outputRange : ['0deg', '360deg']
        });
        let size = 196;

        return (
            <View style={{
                width : 196,
                height : 196,
                borderRadius : 196 / 2,
                backgroundColor : 'rgba(0, 0, 0, 0.3)',
                justifyContent : 'center',
                alignContent : 'center',
                alignItems : 'center'
            }}>

                {audio && audio.location ? <ImageAnimated resizeMode='cover' source={{uri:  audio.bgimage || audio.avatar || audio.coverimage}} 
                    style={{
                        width : 180,
                        height : 180,
                        borderRadius : 90,
                        transform : [{
                            rotate : spin
                        }],
                    }}
                /> : null}

                <View style={{
                    backgroundColor : 'rgba(255, 255, 255, 0.8)',
                    width : 48,
                    height : 48,
                    borderRadius: 24,
                    position : 'absolute',
                    left : '50%',
                    top : '50%',
                    marginLeft : -24,
                    marginTop : -24
                }} />

                <View style={{
                    backgroundColor : '#ffffff',
                    width : 32,
                    height : 32,
                    borderRadius: 16,
                    position : 'absolute',
                    left : '50%',
                    top : '50%',
                    marginLeft : -16,
                    marginTop : -16
                }} />
            </View>
        );
    }
}

class MobiAudioService{
    constructor(){
        this.audio = null;
        this.players = [];
        this.isPlaying = false;
        this._isFullScreen = false;
        this._percent = 0;
        this.audios = [];
    }

    isEmpty(){
        return this.audio ? false : true;
    }

    setAudio(audio){
        this.audio = audio;
        this.players.forEach(e => {
            e.updateState({ audio : audio});
        });
    }

    isActive(e){
        if(!this.audio) return false;
        return (e.id !== undefined && e.id == this.audio.id) || (e.key !== undefined && e.key == this.audio.key);
    }

    check(e, u){
        if(!e && !u) return true;
        if(!e || !u) return false;
        return (e.id !== undefined && e.id == u.id) || (e.key !== undefined && e.key == u.key);
    }
    
    play(audio = null){
        if(audio){
            this.audio = audio;
        }
        this.isPlaying = true;
        this.players.forEach(e => {
            e.setState({isPlaying : true, audio : audio});
        });
    }

    next(){
        if(!this.audios || !this.audios.length) return;
        if(!this.audio){
            return this.play(this.audios[0]);
        }
        let index = this.audios.findIndex(e => {
            return (e.id !== undefined && e.id == this.audio.id) || (e.key !== undefined && e.key == this.audio.key);
        });  

        if(index === -1) {
            return this.play(this.audios[0]);
        }
        if(index == this.audios.length - 1){
            return this.play(this.audios[0]);
        }
        return this.play(this.audios[index + 1]);
    }

    prev(){
        if(!this.audios || !this.audios.length) return;
        if(!this.audio){
            return this.play(this.audios[0]);
        }
        let index = this.audios.findIndex(e => {
            return (e.id !== undefined && e.id == this.audio.id) || (e.key !== undefined && e.key == this.audio.key);
        });   
        if(index === -1) {
            return this.play(this.audios[0]);
        }
        if(index === 0){
            return this.play(this.audios[this.audios.length - 1]);
        }
        return this.play(this.audios[index - 1]);
    }

    isFullScreen(){
        return this._isFullScreen;
    }

    fullScreen(){
        this._isFullScreen = true;
        this.players.forEach(e => {
            e.setState({isFullScreen : this._isFullScreen});
        });
    }

    exitFullScreen(){
        this._isFullScreen = false;
        this.players.forEach(e => {
            e.setState({isFullScreen : this._isFullScreen});
        });
    }

    togglePlay(){
        if(!this.audio) return;
        this.isPlaying = !this.isPlaying;
        this.players.forEach(e => {
            e.setState({isPlaying : this.isPlaying});
        });
    }

    getAudio(){
        return this.audio;
    }

    pause(){
        this.isPlaying = false;
        this.players.forEach(e => {
            e.setState({isPlaying : false});
        });
    }

    remove(){
        this.audio = null;
        this.players.forEach(e => {
            e.setState({isPlaying : false, audio : null});
        });
    }

    connect(player){
        this.players.push(player);
    }

    disconnect(player){
        if(!this.players || !this.players.length) return;
        let index = this.players.indexOf(player);
        if(index !== -1){
            this.players.splice(index, 1);
        }
    }

    getCurrentTime(){
        return this._percent;
    }

    onProgress(percent){
        this._percent = percent;
        this.players.forEach(e => {
            if(e.onProgress){
                e.onProgress(percent);
            }
        });
    }

    getAudios(noCache){
        return new Promise((resolve, reject) => {
            if(this.audios && this.audios.length && !noCache){
                return resolve(this.audios);
            }
            Gate.getSavedAudios().then(data => {
                if(data.status){
                    this.audios = data.items.map(e => {
                        let a = e.audio;
                        a.is_saved = true;
                        return a;
                    });
                    resolve(this.audios);
                }
                else {
                    reject(data);
                }
            })
            .catch(err => reject(err));
        });
    }

    clearList(){
        this.audios = [];
    }
}

export const AudioService = new MobiAudioService();

export class AudioSavedItem extends React.PureComponent{
    _onPress = () => {
        let {audio} = this.props;
        this.props.onPress && this.props.onPress('click', audio);
    }

    _removeAudio = () => {
        let {audio} = this.props;
        this.props.onPress && this.props.onPress('delete', audio);
    }

    render(){
        let {audio, active} = this.props;

        return (
            <View>
                <View style={{
                    position : 'absolute',
                    left : 0,
                    right : 0,
                    top : 0,
                    bottom : 0,
                    padding : 8
                }}>
                    <TouchableOpacity onPress={this._removeAudio}>
                        <View style={{
                            width : 50,
                            height : 50,
                            justifyContent : 'center',
                            alignContent : 'center',
                            alignItems : 'center'
                        }}>
                            <Icon type='Ionicons' name='md-trash' size={32} color='#ffffff' style={{backgroundColor : 'transparent'}} />
                        </View>
                    </TouchableOpacity>
                </View>
                <Interactable.View horizontalOnly={true} snapPoints={[
                    {x: 66},
                    {x: 0, damping: 0.5},
                ]}>
                    <TouchableNativeFeedback onPress={this._onPress}>
                        <View style={{
                            flexDirection : 'row',
                            padding : 8,
                            backgroundColor : active ? 'rgba(0, 255, 0, 0.5)' : 'transparent'
                        }} key={audio.id || audio.key}>
                            <Image resizeMode='cover' style={{
                                width : 50,
                                height : 50,
                                marginRight : 8
                            }} source={{uri : audio.avatar || audio.bgimage || audio.coverimage}} />
                            <View style={{
                                
                            }}>
                                <Text style={{
                                    fontSize : 16,
                                    color: '#ffffff',
                                    backgroundColor : 'transparent'
                                }}>{audio.title}</Text>
                                <Text style={{
                                    fontSize : 14,
                                    color : '#fff',
                                    backgroundColor : 'transparent'
                                }}>{audio.creator}</Text>
                            </View>
                        </View>
                    </TouchableNativeFeedback>
                </Interactable.View>
            </View>
        );
    }
}

export class FullAudioPlayer extends React.PureComponent{
    constructor(props){
        super(props);
        this.state = {
            topAnim : new Animated.Value(0),
            isPlaying : false,
            isMuted : false,
            isFullScreen : false,
            audios : [],
            isLoadingList : false,
            isEnableScroll : true,
            refreshing : false,
            transAnim : new Animated.Value(0),
        };

        this.isShown = false;
        this.currentPage = 0;

        AudioService.connect(this);
    }

    componentDidMount = () => {
        this._amount = true;
    }

    UNSAFE_componentWillUpdate = (nextProps, nextState) => {

    }

    componentDidUpdate = (prevProps, prevState) => {
        if(!this._amount) return;
        if(!this.state.isFullScreen) {
            Log('AudioPlayer > FullPlayer > componentDidUpdate > return');
            return;
        }
        Log('AudioPlayer > FullPlayer > componentDidUpdate');
        if(this.state.isFullScreen && !this.isShown){
            Log('AudioPlayer > FullPlayer > componentDidUpdate > showPlayerAnimation');
            this.showPlayerAnimation();
        }       

        if(!AudioService.check(this.state.audio, prevState.audio)){
            this.onAudioChange();
        }
    }

    updateState(state){
        if(!this._amount || !state) return;
        this.setState(state);
    }

    checkSavedAudio(){
        if(!this._amount || !this.state.audio) return;
        Gate.checkSavedAudio(this.state.audio).then(data => {
            if(!this._amount) return;
            if(data.status){
                if(data.is_saved != this.state.is_saved){
                    let audio = this.state.audio;
                    audio.is_saved = data.is_saved;
                    this.setState({audio : audio});
                }
            }
        })
        .catch(err => Log(err));
    }

    onAudioChange(){
        Log('AudioPlayer > onAudioChange');
        this.checkSavedAudio();
    }

    getAudios(noCache){
        if(!noCache){
            if(this.state.isLoadingList) return;
            this.setState({isLoadingList : true});
        }
        
        AudioService.getAudios(noCache).then(data => {
            Log('AudioPlayer > getAudio >success');
            if(!AudioService.getAudio() && data.length){
                AudioService.setAudio(data[0]);
            }
            this.setState({audios : data, isLoadingList : false, refreshing : false});
        })
        .catch(err => {
            Toast.show(err);
            this.setState({isLoadingList : false, refreshing : false});
        });
    }

    fullscreen(){
        this.setState({isFullScreen : true});
    }

    onFullscreen = () => {
        Log('AudioPlayer > onFullscreen');
        if(!this._amount) return;
        this.setState({isFullScreen : true});
    }

    componentWillUnmount = () => {
        AudioService.disconnect(this);
        this._amount = false;
    }

    showPlayerAnimation(){
        if(!this._amount) return;
        Animated.timing(this.state.topAnim, {
            toValue : 1,
            duration : 500,
            useNativeDriver : true,
            easing : Easing.linear
        }).start(() => {
            this.isShown = true;
            this.componentDidShow();
        });
    }

    componentDidShow(){
        if(!AudioService.getAudio()){
            setTimeout(() => {
                this._showList(() => {
                    this.getAudios();
                });
            }, 500);
        }
    }

    onProgress(percent){
        if(!this._amount) return;
        if(this._slider){
            this._slider.setNativeProps({value : percent});
        }
    }

    hidePlayerAnimation(){
        if(!this._amount) return;
        Animated.timing(this.state.topAnim, {
            toValue : 0,
            duration : 500,
            useNativeDriver : true
        }).start(() => {
            this.isShown = false;
            this.isRotated = false;
            AudioService.exitFullScreen();
            this.props.onExit && this.props.onExit();
        });
    }

    _onBack = () => {
        this.hidePlayerAnimation();
    }

    _togglePlay = () => {
        AudioService.togglePlay();
    }

    _next = () => {
        AudioService.next();
    }

    _prev = () => {
        AudioService.prev();
    }

    onSlidingComplete = (e) => {

    }

    _sliderRef = (c) => {
        this._slider = c;
    }

    setPlayer(player){
        if(this.connectPlayer) return;
        this.connectPlayer = player;
        player.setPlayer(this);
    }

    _save = () => {
        if(!this.state.audio) return;
        let audio = this.state.audio;
        if(!audio) return;
        Gate.toggleSaveAudio(audio).then(data => {
            if(!this._amount) return;
            if(data.status){
                audio.is_saved = data.is_saved;
                this.setState({audio : audio, t : new Date().getTime()});
            }
            Toast.show(data);
            AudioService.clearList();
        })
        .catch(err => Toast.show(err));
    }

    _onAudioItemPress = (action, audio) => {
        if(action == 'click'){
            AudioService.play(audio);
            setTimeout(() => {
                this._onBackPlayer();
            }, 500);
        }
        else if(action == 'delete'){
            let audios = this.state.audios;
            let index = audios.indexOf(audio);
            if(index !== -1){
                audios.splice(index, 1);
                audio.is_saved = false;
                Gate.unSaveAudio(audio).then(data => {
                    Toast.show(data);
                })
                .catch(err => Toast.show(err));
                this.setState({audios : audios, t : new Date().getTime()});
            }
        }
    }

    _renderAudioItem = (audio, index) => {

        return (
            <AudioSavedItem audio={audio} key={audio.id || audio.key} onPress={this._onAudioItemPress} active={AudioService.isActive(audio)} />
        );
    }

    onPageChange(page){
        this.currentPage = page;
        if(page == 1){
            Log('AudioPlayer > onPageChange > ' + page);
            this.getAudios();
        }
        this.setState({isEnableScroll : !page});
    }

    _onMomentumScrollEnd = (e) => {
        let contentOffset = e.nativeEvent.contentOffset;
        let viewSize = e.nativeEvent.layoutMeasurement;
    
        // Divide the horizontal offset by the width of the view to see which page is visible
        let pageNum = Math.floor(contentOffset.x / viewSize.width);
        if(this.currentPage != pageNum){
            this.currentPage = pageNum;
            Log('AudioPlayer > FullPlayer > onMomentumScrollEnd > currentPage > ' + this.currentPage);
            this.onPageChange(this.currentPage);
        }
    }

    _onBackPlayer = () => {
        if(this.scrollView){
            this.onPageChange(0);
            this.scrollView.scrollTo({x : 0, animated : true});
        }
        else{
            Animated.timing(this.state.transAnim, {
                toValue : 0,
                duration : 500,
                useNativeDriver : true
            }).start();
        }
    }

    _scrollViewRef = (c) => {
        this.scrollView = c;
    }

    _showList = (callback) => {
        if(this.scrollView){
            const {width} = Dimensions.get('window');
            this.scrollView.scrollTo({x : width, animated : true});
            setTimeout(() => {
                this.onPageChange(1);
            });
        }
        else{
            Animated.timing(this.state.transAnim, {
                toValue : 1,
                duration : 500,
                useNativeDriver : true
            }).start(() => {
                callback && (typeof callback === 'function') && callback();
            });
        }
    }

    _share = () => {
        this.state.audio && this.props.onAction && this.props.onAction('share', {
            type : 'music',
            item : this.state.audio
        });
    }

    onRefresh = () => {
        this.setState({refreshing : true});
        this.getAudios(true);
    }

    render(){
        Log('AudioPlayer > FullAudioPlayer > render');
        if(!this.state.isFullScreen) return null;
        let audio = AudioService.getAudio();
        
        const {width, height} = Dimensions.get('window');

        let topV = this.state.topAnim.interpolate({
            inputRange : [0, 1],
            outputRange : [height, 0]
        });

        let opac = this.state.topAnim.interpolate({
            inputRange : [0, 1],
            outputRange : [0, 1]
        });

        let playIcon = this.state.isPlaying ? 'pause-circle-outline' : 'play-circle-outline';
        let saveIcon = audio && audio.is_saved ? 'ios-heart' : 'ios-heart-empty';

        let tranX = this.state.transAnim.interpolate({
            inputRange : [0, 1],
            outputRange : [width, 0]
        });

        let tranXOpac = this.state.transAnim.interpolate({
            inputRange : [0, 1],
            outputRange : [0, 1]
        });

        let playerOpac = this.state.transAnim.interpolate({
            inputRange : [0, 1],
            outputRange : [1 , 0]
        });

        let graOpac = this.state.transAnim.interpolate({
            inputRange : [0, 1],
            outputRange : [0.6, 1]
        });

        return (
            <View style={{
                position : 'absolute',
                left : 0,
                top : 0,
                right : 0,
                bottom : 0,
            }}>
                <Animated.View style={[styles.full, {
                    transform : [
                        {
                            translateY : topV
                        }
                    ],
                    opacity : opac
                }]}>
                    {audio ? <BlurImage source={{uri : audio.coverimage || audio.bgimage || audio.avatar}} 
                    amount={10}
                    style={{
                        position : 'absolute',
                        left : 0,
                        top : 0,
                        right : 0,
                        bottom : 0
                    }} resizeMode='cover' /> : null}

                    <LinearGradientAnimated 
                        colors={['#FF249E', '#193963']} 
                        style={[styles.full, {opacity : graOpac}]}
                        start={{x: 0, y: 0}} 
                        end={{x: 1, y: 1}}
                    />

                    <View style={styles.full}>
                        <Animated.View style={[styles.full, {
                            opacity : playerOpac
                        }]}>
                            <View style={{
                                justifyContent : 'center',
                                alignContent : 'center',
                                alignItems : 'center',
                                flex : 1,
                                width : width
                            }}>
                
                                <DiskCD audio={audio} isPlaying={this.state.isPlaying} />

                                <TouchableOpacity style={{
                                    position : 'absolute',
                                    top : 8,
                                    left : 8
                                }} onPress={this._onBack} >
                                    <Icon name='keyboard-backspace' size={32} color={'rgba(255, 255, 255, 0.8)'} style={{backgroundColor : 'transparent'}} />
                                </TouchableOpacity>

                                <TouchableOpacity style={{
                                    position : 'absolute',
                                    top : 8,
                                    right : 8
                                }} onPress={this._showList} >
                                    <Icon name='filter-list' size={32} color={'rgba(255, 255, 255, 0.8)'} style={{backgroundColor : 'transparent'}} />
                                </TouchableOpacity>

                                {audio ? <Text style={{
                                    color : '#fff',
                                    fontFamily : 'DancingScript-Bold',
                                    fontSize : 24,
                                    marginTop : 16,
                                    textAlign : 'center',
                                    backgroundColor : 'transparent'
                                }}>{audio.title}</Text> : null}
                                {audio ? <Text style={{
                                    color : '#fff',
                                    fontFamily : 'DancingScript-Bold',
                                    fontSize: 18,
                                    textAlign : 'center',
                                    backgroundColor : 'transparent'
                                }}>{audio.creator}</Text> : null}
                            </View>
                            <View style={{
                                marginBottom : 32
                            }}>
                                <View style={{
                                    alignContent : 'center',
                                    alignItems : 'center',
                                    flexDirection : 'row',
                                    marginBottom : 0,
                                    padding : 8
                                }}>
                                    <TouchableOpacity onPress={this._save}>
                                        <Icon type='Ionicons' name={saveIcon} size={32} color='#C5E2A0' style={{backgroundColor : 'transparent'}} />
                                    </TouchableOpacity>
                                    <View style={{flex : 1}} /> 
                                    <TouchableOpacity onPress={this._share}>
                                        <Icon type='Ionicons' name={'ios-share-alt'} size={32} color='#70E0DA' style={{backgroundColor : 'transparent'}} />
                                    </TouchableOpacity>
                                </View>

                                <View>
                                    <SvgSlider 
                                        style={{
                                            margin : 16
                                        }} 
                                        ref={this._sliderRef}
                                    />
                                </View>

                                <View style={{
                                    alignContent : 'center',
                                    alignItems : 'center',
                                    justifyContent : 'center',
                                    flexDirection : 'row'
                                }}>
                                    <TouchableOpacity onPress={this._prev}>
                                        <Icon name={'skip-previous'} size={48} color='rgba(255, 255, 255, 0.7)' style={styles.trans} />
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={this._togglePlay}>
                                        <Icon type='MaterialCommunityIcons' name={playIcon} size={64} color='#fff' style={styles.trans} />
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={this._next}>
                                        <Icon name={'skip-next'} size={48} color='rgba(255, 255, 255, 0.7)' style={styles.trans} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>

                        <Animated.View style={[styles.full, {
                            transform : [{
                                translateX : tranX
                            }],
                            opacity : tranXOpac
                        }]}>
                            <View style={{
                                height : 50,
                                alignItems : 'center',
                                flexDirection : 'row',
                                paddingLeft : 8
                            }}>
                                <TouchableOpacity onPress={this._onBackPlayer} >
                                    <Icon name='keyboard-backspace' size={32} color={'rgba(255, 255, 255, 0.8)'} style={styles.trans} />
                                </TouchableOpacity>
                            </View>
                            {this.state.isLoadingList ? <View style={{
                                position : 'absolute',
                                top : 0,
                                left : 0,
                                bottom : 0,
                                right : 0,
                                justifyContent : 'center',
                                alignContent : 'center',
                                alignItems : 'center'
                            }}>
                                <ActivityIndicator color={'#ffffff'} />
                            </View> : null}

                            <ScrollView refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this.onRefresh}
                                />
                            }>
                                {this.state.audios.map(this._renderAudioItem)}
                            </ScrollView>
                        </Animated.View>
                    </View>
                </Animated.View>
            </View>
        );
    }
}

export default class AudioPlayer extends React.PureComponent {
    constructor(props){
        super(props);

        this.state = {
            isMuted : false,
            isPlaying : false,
            isRepeated : false
        };

        AudioService.connect(this);
    }

    componentWillUnmount = () => {
        AudioService.disconnect(this);
    }

    onLoadStart = () => {

    }

    videoError = () => {

    }

    onBuffer = () => {

    }

    onTimedMetadata = () => {

    }

    onReadyForDisplay = () => {

    }

    _onLoad = (e) => {
        this.setState({ duration: e.duration });
    }

    _onProgress = (e) => {
        this.playableDuration = e.playableDuration;
        this.currentTime = e.currentTime;

        let percent = this.currentTime / this.state.duration * 100;

        AudioService.onProgress(percent);
    }

    onEnd = () => {
        AudioService.pause();
        AudioService.next();
    }

    togglePlay = () => {
        AudioService.togglePlay();
    }

    exit = () => {
        AudioService.remove();
        this.props.onExit && this.props.onExit();
    }

    updateState(state){
        if(!this._amount || !state) return;
        this.setState(state);
    }

    setPlayer(player){
        if(this.connectPlayer) return;
        this.connectPlayer = player;
        player.setPlayer(this);
    }

    _fullscreen = () => {
        this.connectPlayer && this.connectPlayer.onFullscreen();
            
        this.props.onFullscreen && this.props.onFullscreen();
    }

    _progressRef = (c) => {
        this._progressBar = c;
    }

    onProgress(e){
        if(this._progressBar){
            this._progressBar.setNativeProps({width : e + '%'});
        }
    }

    render() {
        Log('AudioPlayer');
        if(AudioService.isEmpty()) return null;
        let audio = AudioService.getAudio();
        const icon = this.state.isPlaying ? 'pause' : 'play-arrow';
        return (
            <View style={styles.container}>
                {this.props.main ?
                <Video 
                    source={{uri : audio.location}} 
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
                    onLoad={this._onLoad}       
                    onEnd={this.onEnd}  
                    onError={this.videoError} 
                    onBuffer={this.onBuffer}
                    onTimedMetadata={this.onTimedMetadata}
                    onReadyForDisplay={this.onReadyForDisplay}
                    onProgress={this._onProgress}
                    playInBackground={true}
                    playWhenInactive={false}
                    style={styles.full}
                /> : null }
                <Image style={styles.cover} source={{uri : audio.coverimage || audio.bgimage || audio.avatar}} resizeMode={'cover'} />
                <View style={styles.content}>
                    <View ref={this._progressRef} style={{
                        position : 'absolute',
                        top : 0,
                        left : 0,
                        width : '0%',
                        bottom : 0,
                        backgroundColor : 'rgba(0, 0, 0, 0.3)'
                    }} />
                    <TouchableOpacity onPress={this._fullscreen}>
                        <Image style={styles.square} source={{uri : audio.avatar || audio.bgimage || audio.coverimage}} resizeMode='cover' />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.info} onPress={this._fullscreen}>
                        <Text style={styles.title}>{audio.title}</Text>
                        <Text style={styles.artist}>{audio.creator}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.togglePlay} >
                        <View style={styles.icon}>
                            <Icon size={32} name={icon} color='#fff' style={styles.trans} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.exit} >
                        <View style={styles.icon}>
                            <Icon size={32} name={'close'} color='#fff' style={styles.trans} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

var styles = StyleSheet.create({
    container : {
        height : 48
    },
    full : {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom : 0, 
        right: 0
    },
    content : {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom : 0, 
        right: 0,
        flexDirection : 'row',
        padding : 4,
        alignItems : 'center',
        backgroundColor : 'rgba(233, 30, 99, 0.7)'
    },
    square : {
        width : 40,
        height : 40,
        marginRight : 4
    },
    title : {
        fontSize : 14,
        color : '#fff',
        backgroundColor : 'transparent'
    },
    info : {
        flex : 1,
        height : '100%',
        alignItems : 'center'
    },
    artist : {
        fontSize : 12,
        color : '#efefef',
        backgroundColor : 'transparent'
        
    },
    cover : {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom : 0, 
        right: 0
    },
    icon : {
        width : 32,
        height : 32,
        justifyContent : 'center',
        alignItems : 'center',
        alignContent : 'center',
        backgroundColor : 'transparent'
    },
    full_bg : {
        backgroundColor : 'rgba(233, 30, 99, 0.7)'
    },
    trans: {
        backgroundColor : 'transparent'
    }
});