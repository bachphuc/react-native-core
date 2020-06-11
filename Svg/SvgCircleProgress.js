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

const themes = {
    dark : {
         firstStopColor : '#00FFF6',
         secondStopColor : '#FFF747',
         outlineColor : '#ffffff'
    },
    light : {
        firstStopColor : '#00A19C',
        secondStopColor : '#FF3626',
        outlineColor : '#999999'
   }
};

export default class SvgCircleProgress extends React.PureComponent {
    render() {
        let {size, percent, text} = this.props;
        let halfSize = size / 2;
        let total = 3.14159265 * size;
        let current = total * (1 - percent / 100);
        let strokeWidth = 2;
        let fontSize = Math.round(size / 3);

        let theme = this.props.theme || 'dark';
        let themeStyle = themes[theme];

        return (
            <Svg width={size} height={size}>
                <Defs>
                    <LinearGradient id="exampleGradient">
                        <Stop offset="0%" stopColor={themeStyle.firstStopColor} />
                        <Stop offset="100%" stopColor={themeStyle.secondStopColor} />
                    </LinearGradient>
                </Defs>

                <Circle
                    cx={halfSize}
                    cy={halfSize}
                    r={halfSize - strokeWidth / 2}
                    strokeWidth={strokeWidth}
                    stroke={themeStyle.outlineColor}
                    fill="none"
                />

                <Circle
                    cx={halfSize}
                    cy={halfSize}
                    r={halfSize - strokeWidth / 2}
                    strokeWidth={strokeWidth}
                    stroke="url(#exampleGradient)" 
                    fill="none"
                    strokeDasharray={total}
                    strokeDashoffset={current}
                />
                
                <SvgText
                    fill="url(#exampleGradient)" 
                    fontSize={fontSize}
                    x={halfSize}
                    y={halfSize + fontSize / 2 - 5}
                    textAnchor="middle"
                >{text ? text : percent + '%'}</SvgText>
            </Svg>
        )
    }
}
