import React, { Component } from 'react';
import {View, findNodeHandle, StyleSheet} from 'react-native';

import {BlurView} from '@react-native-community/blur';

import {Log} from './../Utils'
import Image from './Image';

export default class BlurImage extends Component {
    constructor(props){
        super(props);

        this.state = {
            reload : false
        };

        this.loaded = false;
    }

    componentDidMount(){
        this._amount = true;
    }

    componentWillUnmount(){
        this._amount = false;
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.source.uri != nextProps.source.uri){
            this.loaded = false;
            return true;
        }
        if(this.state.reload != nextState.reload){
            return true;
        }
        return false;
    }

    _onSuccess = () => {
        if(!this._amount) return;
        Log('BlurImage > onSuccess');
        this.loaded = true;
        this.setState({
            viewRef: findNodeHandle(this.backgroundImage),
            reload : !this.state.reload
        });
    }

    _onError = () => {

    }

    render(){
        if(!this.props || !this.props.source || !this.props.source.uri) return null;
        return (
            <View {...this.props}>
                
                <Image ref={c => this.backgroundImage = c} {...this.props} onSuccess={this._onSuccess} onError={this._onError} /> 

                {this.loaded && !this.props.hideBlur ? 
                <BlurView
                    style={styles.absolute}
                    viewRef={this.state.viewRef}
                    blurType={this.props.type || 'light'}
                    blurAmount={this.props.amount}
                /> : null}
                {this.props.showOverlay ? 
                    <View style={styles.overlay}></View>
                : null}
            </View>
        );
    }
}

var styles = StyleSheet.create({
    absolute : {
        position : 'absolute',
        top : 0,
        bottom : 0,
        right : 0,
        left : 0
    },
    overlay : {
        position : 'absolute',
        top : 0,
        bottom : 0,
        right : 0,
        left : 0,
        backgroundColor : 'rgba(0, 0, 0, 0.4)'
    }
});