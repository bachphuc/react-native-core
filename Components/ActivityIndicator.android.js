import React, {Component} from 'react';
import {ProgressBarAndroid as RActivityIndicator } from 'react-native';
import Theme from './../Theme';

export default class ActivityIndicator extends Component{
    render(){
        return (
            <RActivityIndicator {...this.props} color={this.props.color || Theme.progressBarColor} />
        );
    }
}