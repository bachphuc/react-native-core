import React, { Component } from 'react';
import {View, TouchableNativeFeedback, TouchableOpacity, Platform, TouchableWithoutFeedback} from 'react-native';

import Icon from './Icon';
import Theme from './../Theme';

let TouchableComponent;

if (Platform.OS === 'android') {
    TouchableComponent = Platform.Version <= 20
        ? TouchableOpacity
        : TouchableNativeFeedback;
} else {
    TouchableComponent = TouchableOpacity;
}

if (TouchableComponent !== TouchableNativeFeedback) {
    TouchableComponent.SelectableBackground = () => ({});
    TouchableComponent.SelectableBackgroundBorderless = () => ({});
    TouchableComponent.Ripple = () => ({});
    TouchableComponent.canUseNativeForeground = () => false;
}

class Touchable extends React.Component {
    static SelectableBackground = TouchableComponent.SelectableBackground;
    static SelectableBackgroundBorderless = TouchableComponent.SelectableBackgroundBorderless;
    static Ripple = TouchableComponent.Ripple;
    static canUseNativeForeground = TouchableComponent.canUseNativeForeground;

  render() {
    let {
        children,
        style,
        foreground,
        background,
        useForeground,
        ...props
    } = this.props;

    // Even though it works for TouchableWithoutFeedback and
    // TouchableNativeFeedback with this component, we want
    // the API to be the same for all components so we require
    // exactly one direct child for every touchable type.
    children = React.Children.only(children);

    if (TouchableComponent === TouchableNativeFeedback) {
        useForeground =
            foreground && TouchableNativeFeedback.canUseNativeForeground();

        if (foreground && background) {
            console.warn(
            'Specified foreground and background for Touchable, only one can be used at a time. Defaulted to foreground.'
            );
        }

        return (
            <TouchableComponent
            {...props}
            useForeground={useForeground}
            background={(useForeground && foreground) || background}>
            <View style={style}>
                {children}
            </View>
            </TouchableComponent>
        );
        } else if (TouchableComponent === TouchableWithoutFeedback) {
        return (
            <TouchableWithoutFeedback {...props}>
            <View style={style}>
                {children}
            </View>
            </TouchableWithoutFeedback>
        );
        } else {
            let TouchableFallback = this.props.fallback || TouchableComponent;
            return (
                <TouchableFallback {...props} style={style}>
                {children}
                </TouchableFallback>
            );
        }
    }
}

export default class CircleNativeButton extends Component {
    _onPress = () => {
        this.props.onPress && this.props.onPress();
    }

    renderIOS(){
        let size = this.props.size || 48;
        let halfSize = size / 2;
        let rippleColor = this.props.rippleColor || 'rgba(0, 0, 0, 0.1)';
        let iconSize = this.props.iconSize || 24;
        let iconColor = this.props.iconColor || '#222222';
        
        return (
            <TouchableOpacity onPress={this._onPress}>
                <View
                    style={{
                        width : size,
                        height : size,
                        borderRadius : halfSize,
                        justifyContent : 'center',
                        alignItems : 'center',
                        alignContent : 'center'
                    }}>
                    
                    <Icon name={this.props.name} type={this.props.type} size={iconSize} color={iconColor} />
                </View>
            </TouchableOpacity>
        );
    }
    
    render() {
        if(Platform.OS == 'ios') return this.renderIOS();

        let size = this.props.size || 48;
        let halfSize = size / 2;
        let rippleColor = this.props.rippleColor || 'rgba(0, 0, 0, 0.1)';
        let iconSize = this.props.iconSize || 24;
        let iconColor = this.props.iconColor || Theme.primaryIconColor;

        return (
            <View style={{
                ...this.props.style,
                width : size,
                height : size,
                borderRadius : halfSize
            }}>
                <Touchable
                    onPress={this._onPress}
                    background={TouchableNativeFeedback.Ripple(rippleColor, true)}
                    style={{
                        width : size,
                        height : size,
                        borderRadius : halfSize,
                        justifyContent : 'center',
                        alignItems : 'center',
                        alignContent : 'center'
                    }}>
                    
                    <Icon name={this.props.name} type={this.props.type} size={iconSize} color={iconColor} />
                </Touchable>
            </View>
        )
    }
}

export class NativeButton extends Component {
    _onPress = () => {
        this.props.onPress && this.props.onPress();
    }

    renderIOS(){       
        return (
            <TouchableOpacity onPress={this._onPress}>
                <View
                    style={{
                        ...this.props.style,
                    }}
                >
                    {this.props.children}
                </View>
            </TouchableOpacity>
        );
    }
    
    render() {
        if(Platform.OS == 'ios') return this.renderIOS();
        let rippleColor = this.props.rippleColor || 'rgba(0, 0, 0, 0.1)';

        return (
            <View style={this.props.style}>
                <Touchable
                    onPress={this._onPress}
                    background={TouchableNativeFeedback.Ripple(rippleColor, true)}
                    >
                    
                    {this.props.children}
                </Touchable>
            </View>
        )
    }
}