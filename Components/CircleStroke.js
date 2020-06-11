import React, { Component } from 'react';
import {View, Text} from 'react-native';

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

import ColorUtils from './../ColorUtils';

export default class CircleStroke extends React.PureComponent {
    render() {
        let size = this.props.size || 64;
        let halfSize = size / 2;
        let color = this.props.color;
        let secondColor = this.props.secondColor || ColorUtils.pSBC(0.2, this.props.color);
        let strokeWidth = this.props.strokeWidth || 4;
        return (
            <View 
                {...this.props}
                style={{
                    ...this.props.style,
                    alignSelf : 'flex-start'
                }}
            >
                <Svg
                    height={size}
                    width={size}
                >
                    <Defs>
                        <LinearGradient id="exampleGradient">
                            <Stop offset="0%" stopColor={color} />
                            <Stop offset="100%" stopColor={secondColor} />
                        </LinearGradient>
                    </Defs>
                    <Circle
                        cx={halfSize}
                        cy={halfSize}
                        r={halfSize - strokeWidth / 2}
                        strokeWidth={strokeWidth}
                        stroke="url(#exampleGradient)" 
                        fill="none"
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
                }}>{this.props.children}</View>
            </View>
        )
    }
}
