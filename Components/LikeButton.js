import React, {Component} from 'react';
import {Animated, NativeModules, TouchableOpacity, LayoutAnimation} from 'react-native';

import Icon from './Icon';

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

export default class LikeButton extends Component{
    constructor(props) {
        super(props);

        this.state = {
            scaleAnim : new Animated.Value(1)
        };
    }

    componentDidMount(){

    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.active != nextProps.active) 
            return true;

        if (this.props.activeColor != nextProps.activeColor) 
            return true;

        if (this.props.size != nextProps.size) 
            return true;

        return false;
    }

    _onPress = () => {  
        if(this.isAnimating) return;
        this.isAnimating = true;
        LayoutAnimation.spring();
        Animated.sequence([
            Animated.timing(this.state.scaleAnim, {
                toValue: this.props.scale || 1.5,
                duration: this.props.duration || 300,
                useNativeDriver : true
            }),
            Animated.timing(this.state.scaleAnim, {
                toValue: 1,
                duration: this.props.duration || 300,
                useNativeDriver : true
            })
        ]).start(() => {
            this.isAnimating = false;
        });
        if(this.props.onPress){
            this.props.onPress();
        }
    }

    render(){
        let {active, activeColor, color} = this.props;
        let type = active ? 'SimpleLineIcons' : 'SimpleLineIcons';
        let name = active ? 'heart' : 'heart';
        let iconColor = active ? (activeColor || '#333333') : (color || '#999999');
        return (
            <TouchableOpacity  onPress={this._onPress} style={{
                ...this.props.style,
                transform : [{
                    scale : this.state.scaleAnim
                }]
            }}>
                <Animated.View>
                    <Icon type={type} color={iconColor} name={name} style={{fontSize : this.props.size || 32}} />
                </Animated.View>
            </TouchableOpacity >
        );
    }
}