import React, { Component } from 'react';
import {View, Text, TextInput as NativeTextInput, StyleSheet} from 'react-native';

import Theme, {FormStyle} from './../../Theme';

const {TextInputStyle} = FormStyle;

export default class TextInput extends Component {
    constructor(props){
        super(props);

        this.state = {
            isFocus : false
        };
    }
    _onFocus = () => {
        this.props.onFocus && this.props.onFocus();
        this.setState({isFocus : true});
    }

    _onBlur = () => {
        this.props.onBlur && this.props.onBlur();
        this.setState({isFocus : false});
    }

    onRef = (c) => {
        this.input = c;
    }

    focus(){
        if(this.input){
            this.input.focus();
        }
    }
    
    render() {
        return (
            <View style={[styles.input, {
                height : TextInputStyle.inputHeight,
                borderColor : this.state.isFocus ? TextInputStyle.activeBorderColor : TextInputStyle.borderColor,
            }]}>
                <NativeTextInput 
                    {...this.props} 
                    underlineColorAndroid='transparent'
                    onFocus={this._onFocus} 
                    onBlur={this._onBlur} 
                    style={{
                        padding : 0,
                    }} 
                    ref={this.onRef}
                />
            </View>
        )
    }
}

var styles = StyleSheet.create({
    input: {
        borderWidth : 1,
        paddingLeft: 8,
        paddingRight : 8,
        justifyContent : 'center',
        borderRadius: 4
    }
})