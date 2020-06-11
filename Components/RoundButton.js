import React, { Component } from 'react';
import {Text, TouchableOpacity} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Icon from './Icon';
import ColorUtils from './../ColorUtils';

export default class RoundButton extends React.PureComponent {
    render() {
        let size = this.props.size || 48;
        let secondColor = this.props.secondColor || ColorUtils.pSBC(0.2, this.props.color);
        let radius = size / 2;
        let styles = {
            height : size,
            borderRadius : radius,
            justifyContent : 'center',
            alignContent : 'center',
            alignItems : 'center',
            flexDirection : 'row',
        };

        if(!this.props.isBlock){
            styles.alignSelf = 'center';
            styles.paddingLeft = radius;
            styles.paddingRight = radius;
        }
        return (
            <TouchableOpacity {...this.props}>
                <LinearGradient 
                    colors={[this.props.color, secondColor]} 
                    style={styles}
                    start={{x: 0.0, y: 0.5}} 
                    end={{x: 1, y: 0.5}}
                >
                    <Icon type={this.props.type} name={this.props.name} size={size/2} color='#ffffff' />
                    <Text style={{
                        fontSize : size / 2.5,
                        color : '#ffffff',
                        marginLeft : 8
                    }}>{this.props.title}</Text>
                </LinearGradient>
            </TouchableOpacity>
        )
    }
}

