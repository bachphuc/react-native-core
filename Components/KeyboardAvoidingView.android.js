import React, {Component} from 'react';
import {View, KeyboardAvoidingView as KAvoidingView} from 'react-native';

export default class KeyboardAvoidingView extends Component{
    render(){
        return (
            <View {...this.props}>
                {this.props.children}
            </View>
        );
    }
}