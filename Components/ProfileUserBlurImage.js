import React, {Component} from 'react';
import { View, Text, Image, ActivityIndicator,  StyleSheet, findNodeHandle} from 'react-native';
import TouchableNativeFeedback from './TouchableNativeFeedback';
import WebImage from 'react-native-awesome-image';
import {BlurView} from '@react-native-community/blur';

import Theme from './../Theme';
import {Log} from './../Utils';
import CircleText from './CircleText';

export default class ProfileUserBlurImage extends Component {
    constructor(props) {
        Log(props);
        super(props);

        this.state = {
            viewRef: null
        };
    }

    imageLoaded = () => {
        this.setState({
            viewRef: findNodeHandle(this.backgroundImage),
            forceUpdate : true
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(nextState.forceUpdate) {
            nextState.forceUpdate = false;
            return true;
        }
        if (this.props.coverImage != nextProps.coverImage) 
            return true;
        if (this.props.avatarImage != nextProps.avatarImage) 
            return true;
        if (this.props.title != nextProps.title) 
            return true;
        if (this.props.isUpdatingProfileImage != nextProps.isUpdatingProfileImage) 
            return true;
        return false;
    }

    renderLoadingUpdateProfileImage() {
        if (!this.props.isUpdatingProfileImage) 
            return null;
        return (<ActivityIndicator
            style={{
            position: 'absolute',
            top: 38,
            left: 38
        }}
            size="small"
            color={Theme.primaryColor}/>);
    }

    chooseProfilePhoto = () => {
        if (this.props.onAvatarClicked) {
            this
                .props
                .onAvatarClicked();
        }
    }

    renderBlurView() {
        if(!this.state.viewRef) return;
        return (<BlurView
            style={styles.absolute}
            viewRef={this.state.viewRef}
            blurType="light"
            blurAmount={20}/>);
    }

    renderCover(){
        if(!this.props.coverImage) return null;
        return (
            <View style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute'
                }}>
                <WebImage
                    style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute'
                }}
                    resizeMode="cover"
                    source={{
                    uri: this.props.coverImage
                }}/>

                <Image
                    ref={(img) => {
                        this.backgroundImage = img;
                    }}
                    source={{
                        uri: this.props.coverImage
                    }}
                    style={styles.absolute}
                    onLoadEnd={this.imageLoaded}
                />
            </View>
        );
    }

    render() {
        Log(this.props.avatarImage);
        return (
            <View
                style={{
                flexDirection: 'column',
                aspectRatio: 2,
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: Theme.primaryColor
            }}>
                {this.renderCover()}
                    
                {this.renderBlurView()}

                <TouchableNativeFeedback onPress={this.chooseProfilePhoto}>
                    <View>
                        {this.props.avatarImage && this.props.avatarImage != 'http://www.social.dmobisoft.com/icon_upload_photo.png' ?
                        <Image
                            style={{
                            width: 96,
                            height: 96,
                            borderRadius: 48
                        }}
                            resizeMode="cover"
                            source={{
                            uri: this.props.avatarImage
                        }}/> : 
                            <CircleText textSize={48} length={1} title={this.props.title} size={96} />
                        }                        
                        {this.renderLoadingUpdateProfileImage()}
                    </View>
                </TouchableNativeFeedback>

                <Text
                    style={{
                    marginTop: 16,
                    fontSize: 32,
                    color: this.props.coverImage ? '#fff' : Theme.primaryTextColor,
                    backgroundColor : 'transparent'
                }}>{this.props.title}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },
    absolute: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    }
});