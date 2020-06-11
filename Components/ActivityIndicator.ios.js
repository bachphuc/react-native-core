import React, {Component} from 'react';
import {ActivityIndicator as RActivityIndicator } from 'react-native';

export default class ActivityIndicator extends Component{
    render(){
        return (
            <RActivityIndicator {...this.props} />
        );
    }
}