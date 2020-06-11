import React from 'react';
import {View, Dimensions} from 'react-native';

import SvgUtils from './SvgUtils';

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

export default class SvgSmoothLine extends React.PureComponent {
    render() {
        let points = [
            [5, 10],
            [10, 40],
            [40, 30],
            [60, 5],
            [90, 45],
            [120, 10],
            [150, 45],
            [200, 10],
            [300, 200],
        ]

        let data = SvgUtils.smoothPath(points);
        console.log('svg data: ' + data);
        let {width, height} = Dimensions.get('window');
        return (
            <View style={{
            }}>
                <Svg width={width} height={300} style={{
                    
                }}>
                    <Defs>
                        <LinearGradient id="exampleGradient">
                            <Stop offset="0%" stopColor={'#00FFF6'} />
                            <Stop offset="100%" stopColor={'#FFF747'} />
                        </LinearGradient>
                    </Defs>

                    <Path 
                        d={data} 
                        stroke="url(#exampleGradient)" 
                        strokeWidth={2} 
                        fill="transparent" 
                    />

                    <Circle
                        cx={100}
                        cy={100}
                        r={50}
                        strokeWidth={5}
                        stroke="url(#exampleGradient)" 
                        fill="none"
                        strokeDasharray="314"
                        strokeDashoffset="95"
                    />
                    
                </Svg>
            </View>
        )
    }
}
