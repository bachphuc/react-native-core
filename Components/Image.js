import React, {Component} from 'react';
import {Platform, Image as NativeImage, StyleSheet, View} from 'react-native';
import WebImage from 'react-native-awesome-image';

import Api from './../Api';
import Icon from './Icon';

export default class Image extends Component{
    constructor(props){
        super(props);

        this.state = {
            loaded : false
        };
    }

    componentDidMount(){
        this._amount = true;
    }

    componentWillUnmount(){
        this._amount = false;
    }

    _onSuccess = (e) => {
        if(!this._amount) return;
        if(this.props.onSuccess){
            this.props.onSuccess(e);
        }
        else if(this.props.onLoad){
            this.props.onLoad(e);
        }
        this.setState({loaded : true});
    }

    render(){
        const {source, style, resizeMode} = this.props;
        if(source && !source.uri && typeof source === 'number'){
            // local image
            let newStyle = style ? (Array.isArray(style) ? [...style]: {...style}) : {};
            if(resizeMode){
                if(newStyle){
                    if(Array.isArray(newStyle)){
                        newStyle.push({
                            resizeMode: resizeMode
                        })
                    }
                    else{
                        newStyle.resizeMode = resizeMode;
                    }
                }
                else{
                    newStyle = {
                        resizeMode
                    }
                }
            }
            return <NativeImage onLoad={this.props.onSuccess} {...this.props} style={newStyle} />
        }
        if( !source || !source.uri) {
            return null;
        }

        if(this.props.placeholder){
            return this.renderPlaceHolder();
        }
        let isLocalImage = this.props.local || false;
        if(source.uri.indexOf('content://') !== -1){
            isLocalImage = true;
        }

        if(isLocalImage){
            return <NativeImage onLoad={this.props.onSuccess} {...this.props} />
        }
        
        let clone = Object.assign({}, source);
        clone.uri = Api.getImage(clone.uri);

        return <WebImage {...this.props} source={clone} onLoad={this._onSuccess} />
    }

    renderPlaceHolder(){
        let {source, placeholder} = this.props;
        if(placeholder === true){
            placeholder = {};
        }
        if(this.props.local && Platform.OS === 'ios'){
            return (
                <View style={styles.wrapper}>
                    {!this.state.loaded ? <View style={styles.holder}>
                        <Icon type={placeholder.type || 'MaterialCommunityIcons'} name={placeholder.name || 'folder-image'} size={placeholder.size || 32} color={placeholder.color || 'rgba(0, 0, 0, 0.5)'} />
                    </View> : null}
                    <NativeImage {...this.props} onLoad={this._onSuccess} />
                </View>
            );
        }
        
        let clone = Object.assign({}, source);
        clone.uri = Api.getImage(clone.uri);
        return (
            <View>
                {!this.state.loaded ? <View style={styles.holder}>
                    <Icon type={placeholder.type || 'MaterialCommunityIcons'} name={placeholder.name || 'folder-image'} size={placeholder.size || 32} color={placeholder.color || 'rgba(0, 0, 0, 0.5)'} />
                </View> : null}
                <WebImage {...this.props} source={clone} onLoad={this._onSuccess} />
            </View>
        );
    }
}

var styles = StyleSheet.create({
    wrapper : {

    },
    holder : {
        position : 'absolute',
        top : 0,
        left : 0,
        bottom : 0, 
        right : 0,
        alignContent : 'center',
        justifyContent : 'center',
        alignItems : 'center'
    }
});