import React, { Component } from 'react';
import {View, Text, Animated} from 'react-native';

import randomColor from 'randomcolor';

export default class CircleColorLoading extends React.PureComponent {
    color = randomColor();
    nextColor = randomColor();

    constructor(props){
        super(props);
        this.state = {
            colorAnim : new Animated.Value(0),
            reload : false
        };
    }

    componentDidMount = () => {
        this._isAmount = true;
        this.startAnimation();
    }

    
    componentWillUnmount = () => {
        this._isAmount = false;
    }   

    startAnimation = () => {
        if(!this.playing){
            Animated.timing(this.state.colorAnim, {
                toValue : 1
            }).start(() => {
                if(this._isAmount){
                    this.playing = !this.playing;
                    this.color = randomColor();
                    this.setState({reload : !this.state.reload})
                    this.startAnimation();
                }
            });
        }
        else{
            Animated.timing(this.state.colorAnim, {
                toValue : 0,
            }).start(() => {
                if(this._isAmount){
                    this.playing = !this.playing;
                    this.nextColor = randomColor();
                    this.setState({reload : !this.state.reload})
    
                    this.startAnimation();
                }
            });
        }
    }    

    render() {
        var color = this.state.colorAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [this.color, this.nextColor],
        });

        return (
            <Animated.View style={{
                width : this.props.size || 96,
                height : this.props.size || 96,
                borderColor : color,
                borderWidth : this.props.borderWidth || 1,
                borderRadius : (this.props.size || 96) / 2
            }} reload={this.state.reload}>
                
            </Animated.View>
        )
    }
}
