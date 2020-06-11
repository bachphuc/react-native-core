import React, {Component} from 'react';
import {KeyboardAvoidingView as KAvoidingView} from 'react-native';

export default class KeyboardAvoidingView extends Component{
    render(){
        return (
            <KAvoidingView behavior="padding" {...this.props} enabled>
                {this.props.children}
            </KAvoidingView>
        );
    }
}