import React, {Component} from 'react';
import {View} from 'react-native';
import Platform from './Platform';

export default class BottomBarIphoneX extends Component{
    constructor(props){
        super(props);
    }

    componentDidMount = () => {
        this._amount = true;
    }

    componentWillUnmount = () => {
        this._amount = false;
    }

    render(){
        if(!Platform.isIphoneX() ) return null;
        return <View style={{height : 34}} />
    }
}