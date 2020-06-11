import React, { Component } from 'react';
import {View} from 'react-native';

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

const SLIDER_HEIGHT = 24;
const STROKE_WIDTH = 2;
const CIRCLE_RADIUS = 10;

export default class SvgSlider extends Component {
    constructor(props){
        super(props);
        this.state = {
            dimensions : false,
            percent : 0
        };
    }

    onLayout = event => {
        if (this.state.dimensions) return;
        let {width, height} = event.nativeEvent.layout
        this.SLIDER_WIDTH = width;
        this.setState({dimensions: {width, height}})
    }

    setNativeProps(params){
        if(params){
            if(params.value){
                this.setState({percent : params.value});
            }
        }
    }

    render() {
        let {percent} = this.state;
        let left = CIRCLE_RADIUS + percent * ( this.SLIDER_WIDTH - 2 * CIRCLE_RADIUS) / 100;
        let thumbTintColor = this.props.thumbTintColor || '#ffffff';
        let maximumTrackTintColor = this.props.maximumTrackTintColor || 'rgba(255, 255, 255, 0.7)';

        return (
            <View style={{
                ...this.props.style,
                height : SLIDER_HEIGHT,
            }} onLayout={this.onLayout}>
                {this.state.dimensions ?
                <Svg width={this.state.dimensions.width} height={SLIDER_HEIGHT}>

                    <Defs>
                        <LinearGradient id="exampleGradient">
                            <Stop offset="0%" stopColor={'#00FFF6'} />
                            <Stop offset="100%" stopColor={'#FFF747'} />
                        </LinearGradient>
                    </Defs>
                    
                    <Line x1={0} y1={SLIDER_HEIGHT / 2} x2={this.SLIDER_WIDTH} y2={SLIDER_HEIGHT / 2}  strokeWidth={STROKE_WIDTH} stroke={maximumTrackTintColor}  /> 
                    <Line x1={0} y1={SLIDER_HEIGHT / 2} x2={left} y2={SLIDER_HEIGHT / 2}  strokeWidth={STROKE_WIDTH} stroke="url(#exampleGradient)"    /> 

                    <Circle
                        cx={left}
                        cy={SLIDER_HEIGHT / 2}
                        r={CIRCLE_RADIUS}
                        fill={thumbTintColor}
                    />
                </Svg>
                : null}
            </View>
        )
    }
}
