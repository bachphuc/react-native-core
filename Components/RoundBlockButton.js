import React, {Component} from 'react';
import {TouchableOpacity, View, Text} from 'react-native';

import Icon from './Icon';

export default class RoundBlockButton extends Component{

    _onPress = () =>{
        if(this.props.onPress){
            this.props.onPress();
        }
    }

    render(){
        return (
            <TouchableOpacity onPress={this._onPress} style={{flex : 1}}>
                <View style={{
                    backgroundColor : '#666666',
                    flexDirection : 'row',
                    height : 44,
                    borderRadius : this.props.borderRadius ? this.props.borderRadius : 44,
                    alignContent : 'center',
                    justifyContent : 'center',
                    alignItems : 'center',
                    flex : 1
                }}>
                    <Icon type={this.props.type} name={this.props.icon || "settings"} size={24} color="#fff" />
                    <Text style={{color : '#fff', marginLeft : 8}}>{this.props.text || 'Submit'}</Text>
                </View>
            </TouchableOpacity>
        );
    }
}