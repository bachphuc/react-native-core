import React, { Component } from 'react';
import {View, Text, Animated, StyleSheet, TouchableWithoutFeedback} from 'react-native';

import CircleImage from './CircleImage';
import AvatarImage from './AvatarImage';
import Image from './Image';
import Icon from './Icon';

import randomColor from 'randomcolor';
import socket from './../Socket/MobiSocket';

import LinearGradient from 'react-native-linear-gradient';
import {Log} from './../Utils';
import Navigator from 'app/Navigator';

const TAG = 'NotificationPanel';

function log(data){
    if(!data) return;
    Log(`${TAG} > ${JSON.stringify(data)}`);
}

const LinearGradientAnimated = Animated.createAnimatedComponent(LinearGradient);

const ITEM_WIDTH = 200;

const ACCEPT_MESSAGE_TYPES = ['text', 'image', 'single_emoticon'];

class NotificationItem extends React.PureComponent{
    constructor(props){
        super(props);

        this.state = {
            anim : new Animated.Value(0),
        };
    }

    componentDidMount(){
        this._amount = true;
        this.show();
    }

    componentWillUnmount(){
        this._amount = false;
    }

    show(){
        let time = this.props.time || 300;
        Animated.timing(this.state.anim, {
            toValue : 1,
            useNativeDriver : true,
            duration : 500
        }).start(() => {
            setTimeout(() => {
                this.hide();
            }, time);
        });
    }

    hide(){
        Animated.sequence([
            Animated.timing(this.state.anim, {
                toValue : 0,
                useNativeDriver : true,
                duration : 500
            }),
        ])
        .start(() => {
            this.props.onHide && this.props.onHide(this.props.item);
        });
    }

    _onPress = () => {
        let {data} = this.props;
        let item = data.item;
        if(!item.user) return;
        Navigator.chat.chat(item.user);
    }

    renderImageMessage(){
        let {data} = this.props;
        let item = data.item;

        let tranX = this.state.anim.interpolate({
            inputRange : [0, 1],
            outputRange : [ITEM_WIDTH, 0]
        });

        let opac = this.state.anim.interpolate({
            inputRange : [0, 1],
            outputRange : [0, 1]
        });
        if(!this.color){
            this.color = randomColor();
        }
        
        return (
            
            <View onPress={this._onPress} style={[this.props.style, {
                marginBottom : 8,
            }]}>
                <TouchableWithoutFeedback onPress={this._onPress}>
                <LinearGradientAnimated 
                    style={{
                        flexDirection : 'column',
                        backgroundColor : this.color,
                        padding : 8,
                        elevation : 4,
                        opacity : opac,
                        transform : [{
                            translateX : tranX
                        }],
                        borderRadius : 8
                    }}
                    colors={['#EC449B', '#D21576']} 
                    start={{x: 0, y: 0}} 
                    end={{x: 1, y: 1}}
                >
                    <View style={{
                    }}>
                        {item.image ? <Image style={{
                            width : '100%',
                            aspectRatio : 16/9,
                        }} resizeMode="cover" source={{uri : socket.getImage(item.image) }} /> : null}
                    </View>
                        
                    <View style={{
                        marginTop : 8,
                        flexDirection : 'row',
                        justifyContent : 'space-between'
                    }}>
                        <AvatarImage source={{uri : item.profile_image ? socket.getImage(item.profile_image) : null}} size={32} title={item.full_name} />

                        <View style={{
                            width : 32,
                            height : 32,
                            justifyContent : 'center',
                            alignContent : 'center',
                            alignItems : 'center',
                        }}>
                            <Icon name='reply' size={24} color='#ffffff' style={{backgroundColor : 'transparent'}} />
                        </View>
                    </View>
                </LinearGradientAnimated>
                </TouchableWithoutFeedback>
            </View>
        );
    }

    render(){
        let {data} = this.props;
        let item = data.item;

        if(item.message_type == 'image'){
            return this.renderImageMessage();
        }

        let tranX = this.state.anim.interpolate({
            inputRange : [0, 1],
            outputRange : [ITEM_WIDTH, 0]
        });

        let opac = this.state.anim.interpolate({
            inputRange : [0, 1],
            outputRange : [0, 1]
        });
        if(!this.color){
            this.color = randomColor();
        }
        
        return (
            
            <View style={[this.props.style, {
                marginBottom : 8,
            }]}>
                <TouchableWithoutFeedback onPress={this._onPress}>
                <LinearGradientAnimated 
                    style={{
                        flexDirection : 'row',
                        backgroundColor : this.color,
                        padding : 8,
                        elevation : 4,
                        opacity : opac,
                        transform : [{
                            translateX : tranX
                        }],
                        borderRadius : 8
                    }}
                    colors={['#EC449B', '#D21576']} 
                    start={{x: 0, y: 0}} 
                    end={{x: 1, y: 1}}
                >
                    <AvatarImage source={{uri : item.profile_image ? socket.getImage(item.profile_image) : null}} size={32} title={item.full_name} />

                    <View style={{
                        marginLeft : 8,
                        flex : 1
                    }}>
                        {item.message ? <Text style={{
                            color : '#fff',
                            fontSize : item.message_type == 'single_emoticon' ? 64 : 12,
                            backgroundColor : 'transparent'
                        }}>{item.message}</Text> : null}

                    </View>

                    <View style={{
                        width : 32,
                        height : 32,
                        justifyContent : 'center',
                        alignContent : 'center',
                        alignItems : 'center'
                    }}>
                        <Icon name='reply' size={24} color='#ffffff' style={{backgroundColor : 'transparent'}} />
                    </View>
                </LinearGradientAnimated>
                </TouchableWithoutFeedback>
            </View>
        );
    }
}

export default class NotificationPanel extends Component {
    constructor(props){
        super(props);

        this.state = {
            item : null
        };

        this.items = [];
        this.isAnimating = false;
    }

    componentDidMount(){
        this._amount = true;

        socket.addEventListener('newMessages', this.newMessageHandle);
    }

    newMessageHandle = (data) => {
        if(data.status && !socket.isInChat()){
            let message = data.chat;

            if(message.user_id != socket.user.id && message.message || message.image){
                // only support type image or text
                if(ACCEPT_MESSAGE_TYPES.indexOf(message.message_type) === -1) return;

                // image is not ready return
                if(message.message_type == 'image' && !message.image) return;
                this.addNotification({
                    type : 'message',
                    item : message
                });
            }
        }
    }

    componentWillUnmount(){
        this._amount = false;

        socket.removeEventListener('newMessages', this.newMessageHandle);
    }

    _onHide = (item) => {
        if(!this._amount) return;
        this.setState({item : null});
        if(this.items.length){
            setTimeout(() => {
                this.deliveryNotification();
            }, 1000);
        }
    }

    deliveryNotification(){
        if(!this._amount) return;
        if(!this.items.length) return;
        let item = this.items.shift();
        this.setState({item});
    }

    addNotification(item){
        if(!this._amount) return;
        this.items.push(item);
        if(!this.state.item){
            this.setState({item : this.items.shift()});
        }
    }

    render() {
        if(!this.state.item) return null;
        let {item} = this.state;
        return (
            <NotificationItem key={1} onHide={this._onHide} data={this.state.item} style={styles.topRightPos} time={item.item.message_type == 'image' ? 4000 : 2000} />     
        )
    }
}

var styles = StyleSheet.create({
    topRightPos : {
        position : 'absolute',
        right : 8,
        top : 64,
        width : ITEM_WIDTH
    }
});