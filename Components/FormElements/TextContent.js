import React, { Component } from 'react';
import {View, Text, TextInput as NativeTextInput} from 'react-native';

import Theme, {FormStyle} from './../../Theme';

const {TextInputStyle} = FormStyle;

export default class TextContent extends Component {
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
    
    render() {
        return (
            <View style={{
                ...this.props.style,
                minHeight : TextInputStyle.inputHeight,
                borderColor : this.state.isFocus ? TextInputStyle.activeBorderColor : TextInputStyle.borderColor,
                borderWidth : 1,
                paddingLeft: 8,
                paddingRight : 8,
                justifyContent : 'center',
            }}>
                <NativeTextInput {...this.props} multiline={true} underlineColorAndroid='transparent' onFocus={this._onFocus} onBlur={this._onBlur} style={{
                    padding : 0,
                    flex : 1
                }} />
            </View>
        )
    }
}
