import React, { Component } from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import Svg,{
    Circle,
    Ellipse,
    G,
    LinearGradient,
    RadialGradient,
    Line,
    Path,
    Polygon,
    Polyline,
    Rect,
    Symbol,
    Text as SvgText,
    Use,
    Defs,
    Stop
} from 'react-native-svg';

import Icon from './../Components/Icon';
import ColorUtils from './../ColorUtils';


export default class SvgCircleButton extends React.PureComponent {
    render() {
        let size = this.props.size || 48;
        let halfSize = size / 2;

        let strokeColors = [];
        if(this.props.stroke){
            let strokeColor = this.props.stroke;
            strokeColors = typeof strokeColor == 'string' ? [strokeColor, ColorUtils.pSBC(0.3, strokeColor)] : strokeColor;
            if(strokeColors.length == 1){
                strokeColors.push(ColorUtils.pSBC(0.15, strokeColors[0] ));
            }
        }


        let fillColors = [];
        if(this.props.fill){
            let fillColor = this.props.fill;
            fillColors = typeof fillColor == 'string' ? [fillColor, ColorUtils.pSBC(0.3, fillColor)] : fillColor;
            if(fillColors.length == 1){
                fillColors.push(ColorUtils.pSBC(0.15, fillColors[0] ));
            }
        }

        let strokeWidth = this.props.strokeWidth || 0;

        return (
            <TouchableOpacity {...this.props}>
                <View>
                    <Svg
                        height={size}
                        width={size}
                    >
                        {this.props.stroke ? <Defs>
                            <LinearGradient id="strokeStyle">
                                <Stop offset="0%" stopColor={strokeColors[0]} />
                                <Stop offset="100%" stopColor={strokeColors[1]} />
                            </LinearGradient>
                        </Defs> : null}

                        {this.props.fill ? <Defs>
                            <LinearGradient id="fillStyle">
                                <Stop offset="0%" stopColor={fillColors[0]} />
                                <Stop offset="100%" stopColor={fillColors[1]} />
                            </LinearGradient>
                        </Defs> : null}

                        <Circle
                            cx={halfSize}
                            cy={halfSize}
                            r={halfSize - strokeWidth / 2}
                            strokeWidth={strokeWidth}
                            stroke={this.props.stroke ? 'url(#strokeStyle)' : 'none' }
                            fill={this.props.fill ? 'url(#fillStyle)' : 'none'}
                        />
                    </Svg>
                    <View style={{
                        position : 'absolute',
                        left : 0,
                        top : 0,
                        right : 0,
                        bottom : 0,
                        justifyContent : 'center',
                        alignContent : 'center',
                        alignItems : 'center'
                    }}>
                        {this.props.name ? <Icon type={this.props.type} name={this.props.name} size={size/2} color='#ffffff' style={{backgroundColor: 'transparent'}} /> : null}
                        {this.props.title ? <Text>{this.props.title}</Text> : null}
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}
