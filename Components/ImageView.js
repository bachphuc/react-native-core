import React, {Component} from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
import Image from './Image';
import Icon from './Icon';
import CircleColorLoading from './CircleColorLoading';

import {Log} from './../Utils';

import lang from './../lang';

export default class ImageView extends Component{
    constructor(props){
        super(props);
        this.state = {
            'status' : 'loading'
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(nextState.status != this.state.status){
            return true;
        }
        // check if style is updated
        if(this.props.style && nextProps.style){
            let currentStyle = this.props.style;
            let nextStyle = nextProps.style;
            if(currentStyle.width != nextStyle.width){
                return true;
            }
            if(currentStyle.height != nextStyle.height){
                return true;
            }
            if(currentStyle.aspectRatio != nextStyle.aspectRatio){
                return true;
            }
            if(currentStyle.backgroundColor != nextStyle.backgroundColor){
                return true;
            }
        }
        return false;
    }

    _onSuccess = (event) => {
        this.setState({status : 'loaded'});
    }

    _onError = (event) => {
        Log('ImageView > _onError > ' + event.uri);
        this.setState({status : 'error'});
    }

    retry = () => {
        this.setState({status : 'loading'});
    }

    render(){
        return (
            <View style={this.props.style || undefined}>  
                {this.state.status !== 'error' ? 
                <Image {...this.props} onSuccess={this._onSuccess} onError={this._onError} />
                : null}

                {this.state.status !== 'loaded' ? <View style={{
                    position : 'absolute',
                    top : 0,
                    left : 0,
                    bottom : 0, 
                    right : 0,
                    alignContent : 'center',
                    justifyContent : 'center',
                    alignItems : 'center'
                }}>  
                    {this.state.status === 'loading' ?

                    <CircleColorLoading />
                    : 
                    <View>
                        <TouchableOpacity onPress={this.retry}>
                            <Icon type='Ionicons' name='ios-information-circle-outline' color='#ffffff' size={96} />
                        </TouchableOpacity>
                        <Text style={{
                            color : '#fff'
                        }}>{lang('tap_to_reload')}</Text>
                    </View>
                    }
                </View> : null}
                
            </View>
        );
    }
}