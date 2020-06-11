import React from 'react';
import {TouchableOpacity} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Icon from './Icon';
import ColorUtils from './../ColorUtils';

export default class CircleButton extends React.PureComponent {
    render() {
        let {color, secondColor} = this.props;
        let size = this.props.size || 48;
        if(!color){
            color = '#2196f3';
        }

        if(!secondColor){
            secondColor = ColorUtils.pSBC(0.15, color);
        }

        return (
            <TouchableOpacity {...this.props}>
                <LinearGradient colors={[color, secondColor]} style={{
                    width : size,
                    height : size,
                    borderRadius : size / 2,
                    justifyContent : 'center',
                    alignContent : 'center',
                    alignItems : 'center',
                }}>
                    <Icon type={this.props.type} name={this.props.name} size={size/2} color='#ffffff' />
                </LinearGradient>
            </TouchableOpacity>
        )
    }
}
