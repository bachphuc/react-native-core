import React, {Component} from 'react';
import {View, StyleSheet, Animated} from 'react-native';

export default class HorizontalProgressBar extends Component{
    constructor(props){
        super(props);
        this.state = {
            anim : new Animated.Value(0),
        };
    }

    componentDidMount(){
        this._amount = true;
        if(this.props.processing){
            this.start();
        }
    }

    componentWillUnmount(){
        this._amount = false;
        if(this.animation){
            this.animation.stop();
            this.animation = null;
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.processing != nextProps.processing) {
            if(!this.props.processing && nextProps.processing){
                this.start();
            }
            return true;
        }

        return false;
    }

    start(){
        if(!this._amount) return;

        if(this.isPlaying) return;
        this.isPlaying = true;
        
        let time = this.props.time || 1000;
        let steps = [
            Animated.timing(this.state.anim, {
                toValue: 1,
                duration: time,
                useNativeDriver : true
            }),
            Animated.timing(this.state.anim, {
                toValue: 0,
                duration: time,
                useNativeDriver : true
            })
        ];

        this.animation = Animated.sequence(steps);
        this.animation.start(() => {
            this.isPlaying = false;
            if(this.props.processing){
                this.start();
            }
        });
    }

    render(){
        let scale = this.state.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });
        let opac = this.state.anim.interpolate({
            inputRange : [0, 1],
            outputRange : [0, 1]
        });

        return (
            <View style={styles.wrap} onLayout={this._onLayout}>
                <Animated.View style={[styles.barScale, {
                    backgroundColor : 'red',
                    transform : [{
                        scaleX : scale
                    }],
                    opacity : opac
                }]} />
            </View>
        );
    }
}

var styles = StyleSheet.create({
    wrap : {
        height : 2,
        backgroundColor : '#efefef'
    },
    bar : {
        height: 2,
        position: 'absolute',
        width: 40,
    }, 
    barScale : {
        height: 2,
        position: 'absolute',
        width: '100%',
    }
});