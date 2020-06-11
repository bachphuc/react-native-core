import React, { Component } from 'react';
import {TouchableWithoutFeedback, Animated, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');

export default class NavigationMenu extends Component {
    constructor(props){
        super(props);

        this.state = {
            anim : new Animated.Value(0),
            wrapAnim : new Animated.Value(0),
            useNavigationMenu : true
        };

        this.isShown = false;
        this.isAnimating = false;
    }

    componentDidMount(){
        this._amount = true;
    }

    componentWillUnmount(){
        this._amount = false;
    }

    show(){
        if(this.isAnimating) return;
        this.isAnimating = true;
        Animated.sequence([
            Animated.timing(this.state.wrapAnim, {
                toValue : 1,
                duration : 0,
                useNativeDriver : true,
            }),
            Animated.timing(this.state.anim, {
                toValue : 1,
                useNativeDriver : true,
                duration : 500,
                useNativeDriver : true,
                
            })
        ]).start(() => {
            this.isShown = true;
            this.isAnimating = false;
        });
    }

    hide(){
        if(this.isAnimating) return;
        this.isAnimating = true;
        Animated.sequence([
            Animated.spring(this.state.anim, {
                toValue : 0,
                useNativeDriver : true,
                duration : 500
            }),
            Animated.timing(this.state.wrapAnim, {
                toValue : 0,
                useNativeDriver : true,
                duration : 0
            })
        ]).start(() => {
            this.isShown = false;
            this.isAnimating = false;
        });
    }

    toggle(){
        if(this.isShown){
            this.hide();
        }
        else{
            this.show();
        }
    }

    _hideDrawer = () => {
        this.hide();
    }

    render() {
        let x = -1 * width;
        let tranX = this.state.anim.interpolate({
            inputRange : [0, 1],
            outputRange : [x, 0]
        });

        let opacity = this.state.anim.interpolate({
            inputRange : [0, 1],
            outputRange : [0, 1]
        });

        let wrapX = this.state.wrapAnim.interpolate({
            inputRange : [0, 1],
            outputRange : [x, 0]
        });

        return (
            <Animated.View style={{
                position : 'absolute',
                left : 0,
                top : 0,
                bottom : 0, 
                right : 0,
                transform : [{
                    translateX : wrapX
                }]
            }}>
                <TouchableWithoutFeedback onPress={this._hideDrawer}>
                    <Animated.View style={{
                        position : 'absolute',
                        left : 0,
                        top : 0,
                        bottom : 0, 
                        right : 0,
                        backgroundColor : 'rgba(0, 0, 0, 0.5)',
                        opacity : opacity
                    }} />
                </TouchableWithoutFeedback>

                <Animated.View style={{
                    position : 'absolute',
                    left : 0,
                    top : 0,
                    bottom : 0, 
                    width : '80%',
                    backgroundColor : '#ffffff',
                    transform : [{
                        translateX : tranX
                    }]
                }}>{this.props.children}</Animated.View>
            </Animated.View>
        )
    }
}
