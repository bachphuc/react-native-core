import React, {Component} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import Theme from './../Theme';

export default class SnackView extends Component{

    _onPress = () => {
        if(this.props.onPress){
            this.props.onPress();
        }
    }

    render(){
        if(!this.props.visible) return null;
        return (
            <View style={{
                height : Theme.toolBar.height,
                backgroundColor : '#444444',
                alignItems : 'center',
                paddingLeft : 8,
                paddingRight : 8,
                flexDirection : 'row'
            }}>
                <Text style={{color : '#ffffff', marginLeft : 8}}>{this.props.text || 'No internet connection.'}</Text>
                <View style={{flex : 1}}></View>
                <TouchableOpacity onPress={this._onPress}>
                    <Text style={{color : '#efefef',fontWeight : 'bold'}}>{this.props.actionText || 'RETRY'}</Text>
                </TouchableOpacity>
            </View>
        );
    }
}