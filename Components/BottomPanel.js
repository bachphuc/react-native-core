import React, { Component } from 'react';
import {View, Text, Animated, TouchableWithoutFeedback} from 'react-native';
import Dimensions from './Dimensions';

export default class BottomPanel extends React.PureComponent {
    constructor(props){
        super(props);

        this.state = {
            topAnim : new Animated.Value(0),
            leftAnim : new Animated.Value(0)
        };
    }
    componentDidMount = () => {
        this.show();
    }

    show(){
        Animated.sequence([
            Animated.timing(this.state.topAnim, {
                toValue : 1,
                duration : 300,
                useNativeDriver : true
            }),
            Animated.timing(this.state.leftAnim, {
                toValue : 1,
                duration : 300,
                useNativeDriver : true,
                delay : 50
            })
        ])
        .start();
    }

    hide = () => {
        Animated.timing(this.state.topAnim, {
            toValue : 0,
            duration : 300,
            useNativeDriver : true
        }).start(() => {
            this.props.onRequestHide && this.props.onRequestHide();
        });
    }

    componentDidUpdate = (prevProps, prevState) => {
        
    }

    render() {
        const {width , height} = Dimensions.get('window');
        const top = this.state.topAnim.interpolate({
            inputRange : [0, 1],
            outputRange : [height, 0]
        });

        const opac = this.state.topAnim.interpolate({
            inputRange : [0, 1],
            outputRange : [0, 1]
        });

        const left = this.state.leftAnim.interpolate({
            inputRange : [0, 1],
            outputRange : [50, 0]
        });
        const leftOpac = this.state.leftAnim.interpolate({
            inputRange : [0, 1],
            outputRange : [0, 1]
        });

        return (
            <View style={{
                backgroundColor: 'transparent',
                position : 'absolute',
                top : 0,
                left : 0,
                right : 0,
                bottom : 0,
            }}>
                <Animated.View style={{
                    position : 'absolute',
                    bottom : 0,
                    left : 0,
                    right : 0,
                    top : 0,
                    backgroundColor : 'rgba(0, 0, 0, 0.5)',
                    opacity : opac
                }}>
                    <TouchableWithoutFeedback onPress={this.hide} style={{
                        position : 'absolute',
                        bottom : 0,
                        left : 0,
                        right : 0,
                        top : 0,
                    }}>
                        <View style={{
                            position : 'absolute',
                            top : 0,
                            left : 0,
                            right : 0,
                            bottom : 0,
                        }}></View>
                    </TouchableWithoutFeedback>
                </Animated.View>

                <Animated.View style={{
                    position : 'absolute',
                    bottom : 0,
                    left : 0,
                    right : 0,
                    backgroundColor : '#ffffff',
                    transform : [{
                        translateY : top
                    }]
                }}>
                    <Animated.View style={{
                        transform : [{
                            translateX : left
                        }],
                        opacity : leftOpac
                    }}>
                        {this.props.children}
                    </Animated.View>
                </Animated.View>
            </View>
        )
    }
}
