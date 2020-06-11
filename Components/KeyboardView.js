/**
 * Created by andrewhurst on 10/5/15.
 */
import React, {Component} from 'react';
import { Keyboard, LayoutAnimation, View, StyleSheet, StatusBar, ViewPropTypes} from 'react-native';

import PropTypes from 'prop-types';

import Theme from './../Theme';
import {Log} from './../Utils';
import Toast from './Toast';
import Platform from './Platform';
import Dimensions from './Dimensions';

const styles = StyleSheet.create({
    container: {

    }
});

// From: https://medium.com/man-moon/writing-modern-react-native-ui-e317ff956f02
const defaultAnimation = {
    duration: 500,
    create: {
        duration: 300,
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity
    },
    update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 20
    }
};

const { width, height } = Dimensions.get('window');

let STATUS_BAR_HEIGHT = Platform.OS == 'ios' ? 20 : StatusBar.currentHeight;

const CONTENT_HEIGHT = height - STATUS_BAR_HEIGHT;
const DEFAULT_KEYBOARD_HEIGHT = (height - STATUS_BAR_HEIGHT - Theme.toolBar.height) / 2;

export default class KeyboardView extends Component {
    static propTypes = {
        topSpacing: PropTypes.number,
        onToggle: PropTypes.func,
        style: ViewPropTypes.style,
        forceShowOnKeyboard : PropTypes.bool,
        initShow : PropTypes.bool,
        visible : PropTypes.bool,
    };

    static defaultProps = {
        topSpacing: 0,
        onToggle: () => null,
        forceShowOnKeyboard : false,
        initShow : false,
        visible : false
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            keyboardHeight: 0,
            isKeyboardOpened: false,
            reload : false
        };
        this._listeners = null;

        this.KEYBOARD_HEIGHT = 0;
    }

    componentDidMount() {
        this._amount = true;
        const updateListener = Platform.OS === 'android'
            ? 'keyboardDidShow'
            : 'keyboardWillShow';
        const resetListener = Platform.OS === 'android'
            ? 'keyboardDidHide'
            : 'keyboardWillHide';
        this._listeners = [
            Keyboard.addListener(updateListener, this.updateKeyboardSpace),
            Keyboard.addListener(resetListener, this.resetKeyboardSpace)
        ];
        if(this.props.visible){
            this.show();
        }

        Dimensions.onSizeChange(this._onSizeChanged);
    }

    componentWillUnmount() {
        this._amount = false;
        this
            ._listeners
            .forEach(listener => listener.remove());

        Dimensions.removeOnSizeChange(this._onSizeChanged);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.visible != nextProps.visible){
            return true;
        }

        if(nextState.forceRender){
            return true;
        }

        if(this.props.children != nextProps.children){
            return true;
        }

        return false;
    }

    UNSAFE_componentWillReceiveProps = (nextProps) => {
        if(this.props.visible && !nextProps.visible){
            this.hide();
        }
        else if(!this.props.visible && nextProps.visible){
            this.show();
        }
    }

    _onSizeChanged = (size) => {
        this.KEYBOARD_HEIGHT = 0;
        this.setState({reload : !this.state.reload});
    }

    show = () => {
        if(Platform.OS == 'ios'){
            LayoutAnimation.configureNext(defaultAnimation);
        }

        let h = this.KEYBOARD_HEIGHT || DEFAULT_KEYBOARD_HEIGHT;

        this.setState({
            keyboardHeight : h,
            forceRender : true
        }, this.props.onToggle(true, h));
    }

    updateKeyboardSpace = (event) => {
        if (!event.endCoordinates) {
            this.setState({isKeyboardOpened : true});
            return;
        }

        if(Platform.OS == 'ios'){
            LayoutAnimation.configureNext(defaultAnimation);
        }

        // get updated on rotation
        const screenHeight = Dimensions.get('window').height;
        // when external physical keyboard is connected event.endCoordinates.height
        // still equals virtual keyboard height however only the keyboard toolbar is
        // showing if there should be one
        
        if(!this.KEYBOARD_HEIGHT){
            let {BOTTOM_PADDING_HEIGHT} = Dimensions;
            this.KEYBOARD_HEIGHT = (screenHeight - event.endCoordinates.screenY) + this.props.topSpacing - BOTTOM_PADDING_HEIGHT;
            Log(`KeyboardView >keyboardHeight: ${keyboardHeight}, screenHeight: ${screenHeight}, screenY: ${event.endCoordinates.screenY}, topSpacing: ${this.props.topSpacing}`);
        }

        let keyboardHeight = this.KEYBOARD_HEIGHT;

        this.setState({
            keyboardHeight,
            isKeyboardOpened: true,
            forceRender : true
        }, this.props.onToggle(true, keyboardHeight));
    }

    resetKeyboardSpace = (event) => {
        if(this.props.visible) {
            this.setState({isKeyboardOpened : false});
            return;
        }

        if(Platform.OS == 'ios'){
            LayoutAnimation.configureNext(defaultAnimation);
        }

        this.setState({
            keyboardHeight: 0,
            isKeyboardOpened: false,
            forceRender : true
        }, this.props.onToggle(false, 0));
    }

    hide = () => {
        if(this.state.isKeyboardOpened) return;

        if(Platform.OS == 'ios'){
            LayoutAnimation.configureNext(defaultAnimation);
        }

        this.setState({
            keyboardHeight: 0,
            forceRender : true
        }, this.props.onToggle(false, 0));
    }

    render() {
        this.state.forceRender = false;
        return (
            <View
                style={[
                styles.container, {
                    height: this.state.keyboardHeight
                },
                this.props.style
            ]}>
                {this.props.children}
            </View>
        );
    }
}

export class FixKeyboardViewIOS extends Component{
    render(){
        if(Platform.OS == 'android') return null

        return <KeyboardView />
    }
}