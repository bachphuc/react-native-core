import React, { Component } from 'react';
import {View, Text} from 'react-native';

import {Utils} from './../Utils';

export default class ProgressBar extends Component {
    render() {
        let color = this.props.color || '#9E9E9E';
        let value = this.props.value || 0;
        return (
            <View style={this.props.style}>
                <View style={{
                    flexDirection : 'row',
                    justifyContent : 'space-between'
                }}>
                    <Text>Progress</Text>
                    <Text style={{
                        color : color
                    }}>{Utils.round(value, 2)}%</Text>
                </View>
                
                <View style={{
                    height : 6,
                    marginTop : 6,
                    backgroundColor : color,
                    borderRadius : 3,
                    opacity : 0.3
                }}>
                    <View style={{
                        backgroundColor : color,
                        position : 'absolute',
                        height : 6,
                        left : 0,
                        top : 0,
                        width : value + '%',
                        borderRadius : 3,
                        opacity : 1
                    }} />
                </View>
            </View>
        )
    }
}
