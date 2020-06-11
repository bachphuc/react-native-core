import React, { Component } from 'react';
import {View,  TouchableOpacity, StyleSheet, Animated} from 'react-native';

import Icon from './Icon';

class FloatButtonItem extends Component{
    _onPress = () => {
        this.props.onPress && this.props.onPress(this.props.button);
    }

    render(){
        let {button} = this.props;

        return (
            <TouchableOpacity onPress={this._onPress} 
                style={[ styles.floatBtn, {
                    backgroundColor : button.color,
                    ...this.props.style
                }]}>
                <Icon name={button.name} type={button.type} size={24} color='#fff' />
            </TouchableOpacity>    
        );
    }
}

export class FloatButton extends Component{
    _onPress = () => {
        this.props.onPress && this.props.onPress();
    }

    render(){
        let {color, type, name} = this.props;

        return (
            <TouchableOpacity onPress={this._onPress} 
                style={[styles.floatBtnPos, styles.floatBtn, {
                    backgroundColor : color,
                    ...this.props.style
                }]}>
                <Icon name={name} type={type} size={24} color='#fff' />
            </TouchableOpacity>    
        );
    }
}

var FloatButtonAnimated = Animated.createAnimatedComponent(FloatButtonItem);

export default class FloatActionButton extends Component {

    constructor(props){
        super(props);

        this.state = {
            isShowing : false,
            anim : new Animated.Value(0)
        };
    }

    toggleButton = () => {

        if(this.isAnimating) return;
        this.isAnimating = true;
        if(this.state.isShowing){
            this.setState({isShowing : false});
            Animated.timing(this.state.anim, {
                toValue : 0,
                useNativeDriver : true,
                duration : 500
            }).start(() => {
                this.isAnimating = false;
                this.tmpAction && this.props.onPress && this.props.onPress(this.tmpAction);
            });
        }
        else{
            this.setState({isShowing : true});
            Animated.timing(this.state.anim, {
                toValue : 1,
                useNativeDriver : true,
                duration : 500
            }).start(() => {
                this.isAnimating = false;
            });
        }
    }

    _onPress = (button) => {
        this.toggleButton();
        this.tmpAction = button;
    }

    render() {
        let scale = this.state.anim.interpolate({
            inputRange : [0, 1],
            outputRange : [0.5, 1]
        });

        let opac = this.state.anim.interpolate({
            inputRange : [0, 1],
            outputRange : [0, 1]
        });

        let transY = this.state.anim.interpolate({
            inputRange : [0, 1],
            outputRange : [128, 0]
        });

        let {buttons, color, type, name} = this.props;

        return (
            <View style={styles.floatBtnPos}>
                {buttons.map((button, index) => 
                    <FloatButtonAnimated key={index} button={button} onPress={this._onPress} 
                        style={{
                            opacity : opac ,
                            transform : [{
                                scale : scale,
                            }, {
                                translateY : transY
                            }]
                        }}
                    />      
                )}

                <FloatButtonItem button={{color, type, name}} onPress={this.toggleButton} />  
            </View>
        )
    }
}

var styles = StyleSheet.create({
    tabContent : {
        flex : 1
    } ,
    floatBtnPos : {
        position : 'absolute',
        right : 16,
        bottom : 16
    },
    floatBtn : {
        width : 48,
        height : 48,
        alignItems : 'center',
        alignContent : 'center',
        justifyContent : 'center',
        borderRadius : 24,
        elevation : 4,
        marginTop : 8,
        marginBottom : 8
    }
});
