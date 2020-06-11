import React, {Component} from 'react';
import {View, Text, Image, ActivityIndicator} from 'react-native';
import TouchableNativeFeedback from './TouchableNativeFeedback';
import WebImage from 'react-native-awesome-image';
import Theme from './../Theme';
import {Log} from './../Utils';

export default class ProfileUserImage extends Component {
    constructor(props) {
        Log(props);
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.coverImage != nextProps.coverImage) return true;
        if(this.props.avatarImage != nextProps.avatarImage) return true;
        if(this.props.title != nextProps.title) return true;
        if(this.props.isUpdatingProfileImage != nextProps.isUpdatingProfileImage) return true;
        return false;
    }

    renderLoadingUpdateProfileImage(){
        if(!this.props.isUpdatingProfileImage) return null;
        return (
            <ActivityIndicator style={{
                position : 'absolute',
                top : 38,
                left : 38
            }} size="small" color={Theme.primaryColor} />
        );
    }

    chooseProfilePhoto = () => {
        if(this.props.onAvatarClicked){
            this.props.onAvatarClicked();
        }
    }

    render() {
        return (
            <View
                style={{
                flexDirection: 'column',
                aspectRatio: 2,
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor : Theme.primaryColor
            }}>
                <WebImage
                    style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute'
                }}
                    resizeMode="cover"
                    source={{uri: this.props.coverImage}}/>

                <View
                    style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)'
                }}></View>

                <TouchableNativeFeedback onPress={this.chooseProfilePhoto}>
                    <View>
                        <Image
                            style={{
                            width: 96,
                            height: 96,
                            borderRadius: 96
                        }}
                            resizeMode="cover"
                            source={{
                            uri: this.props.avatarImage
                        }}/>{this.renderLoadingUpdateProfileImage()}
                    </View>
                </TouchableNativeFeedback>

                <Text
                    style={{
                    marginTop: 16,
                    fontSize: 32,
                    color: '#fff'
                }}>{this.props.title}</Text>
            </View>
        );
    }
}