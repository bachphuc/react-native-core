import React, { Component } from 'react';
import {View, Text, Dimensions} from 'react-native';

import SvgUtils from './SvgUtils';
import {Log} from './../Utils';

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

export default class SvgLineChart extends Component {
    render() {
        let {width, height} = Dimensions.get('window');

        let {data} = this.props;

        let chartWidth = width - 32;
        let chartHeight = chartWidth * 9 / 16;

        let itemWidth = chartWidth / data.length;

        let chartPoints = [];

        let maxY = Math.max.apply(Math, data.map(e => parseInt(e.time)));
        let minY = Math.min.apply(Math, data.map(e => parseInt(e.time)));
        let distanceY = maxY - minY;

        let chartHeightContent = chartHeight / 1.2;

        let ratio = distanceY / chartHeightContent;

        let beginWeekPoint = null;

        data.forEach((e, index) => {
            let p = [0, 1];
            p[0] = index * itemWidth;

            p[1] = ratio === 0 ? chartHeight : chartHeight - e.time / ratio;
            Log(`process point: chartHeight: ${chartHeight} time: ${e.time}, ratio: ${ratio}`)
            chartPoints.push(p);
            if(e.is_begin_of_current_week){
                beginWeekPoint = p;
            }
        });
        let lineStroke = 2;
        Log('chartHeight: ' + chartHeight + ', chartPoints: ' + JSON.stringify(chartPoints));
        let chartData = SvgUtils.createLine(chartPoints);
        let smoothData = SvgUtils.smoothPath(chartPoints);
        var smoothDataClone = smoothData.slice(0);
        Log('smoothData: ' + smoothData);

        smoothDataClone+= ` V ${chartHeight} H 0 V ${chartPoints[0][0]} Z`;
        let lastPoint = chartPoints[chartPoints.length - 1];

        return (
            <View style={{
                justifyContent : 'center',
                alignContent : 'center',
                alignItems : 'center'
            }}>
                <Svg width={chartWidth} height={chartHeight}>
                    <Defs>
                        <LinearGradient id="exampleGradient">
                            <Stop offset="0%" stopColor={'#06A9FB'} />
                            <Stop offset="50%" stopColor={'#99FF9A'} />
                            <Stop offset="100%" stopColor={'#C9FE24'} />
                        </LinearGradient>
                    </Defs>

                    <Line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight}  strokeWidth={lineStroke} stroke="white"/> 
                    {1 == 2 ?  <Line x1={0} y1={chartHeight} x2={0} y2={0}  strokeWidth={lineStroke} stroke="white"/>: null}
                    
                    <Path 
                        d={smoothDataClone} 
                        stroke="none" 
                        strokeWidth={1} 
                        fill={'rgba(0, 55, 60, 0.3)'} 
                    />
                    
                    <Path 
                        d={smoothData} 
                        stroke="url(#exampleGradient)" 
                        strokeWidth={2} 
                        fill="transparent" 
                    />

                    <Line x1={beginWeekPoint[0]} y1={0} x2={beginWeekPoint[0]} y2={chartHeight}  strokeWidth={1} stroke="white" strokeDasharray={[5]} /> 

                    <Circle
                        cx={lastPoint[0]}
                        cy={lastPoint[1]}
                        r={4}
                        fill="url(#exampleGradient)" 
                    />

                </Svg>
            </View>
        )
    }
}
