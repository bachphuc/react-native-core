import React, { Component } from 'react';
import {View, Text} from 'react-native';

export default class FieldInput extends Component {
    render() {
        let {title} = this.props;
        return (
            <View style={{
                marginBottom : 16
            }}>
                <Text style={{
                    marginBottom : 8
                }}>{title}</Text>
                {this.props.children}
            </View>
        )
    }
}
