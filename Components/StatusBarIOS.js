import React, {Component} from 'react';
import {View} from 'react-native';
import Platform from './Platform';

export default class StatusBarIOS extends Component{
    render(){
        if(Platform.OS == 'android') return null;
        return <View style={{height : Platform.isIphoneX() ? 44 : 20}} />
    }
}