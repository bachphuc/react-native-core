import React, { Component } from 'react';
import {View, Text} from 'react-native';
import Icon from './Icon';

export default class CircleIcon extends React.PureComponent {
    render() {
        let size = this.props.size || 32;
        return (
            <View style={[this.props.style, {
                width : size,
                height : size,
                borderRadius : size / 2,
                backgroundColor : this.props.bgColor || '#444444',
                justifyContent : 'center',
                alignContent : 'center',
                alignItems : 'center'
            }]}>
                <Icon type={this.props.type} name={this.props.name} size={this.props.iconSize || 16} color={this.props.color || '#ffffff'} />
            </View>
        )
    }
}
