import React, {Component} from 'react';
import {View, Text, Image, ActivityIndicator, Animated, Easing} from 'react-native';

import lang from './../lang';
import Icon from './Icon';

var AnimatedIcon = Animated.createAnimatedComponent(Icon);

export class CompletedIcon extends React.PureComponent{
    constructor(props){
        super(props);
        this.state = {
            scaleAnim : new Animated.Value(0)
        };
    }

    componentDidMount = () => {
        setTimeout(() => {
            Animated.timing(this.state.scaleAnim, {
                toValue : 1,
                duration : 500,
                useNativeDriver : true,
                easing : Easing.easeInOutBack
            })
            .start();
        }, 100);
    }

    render(){
        const scale = this.state.scaleAnim.interpolate({
            inputRange : [0, 1],
            outputRange : [0.5, 1]
        });

        return (
            <AnimatedIcon {...this.props} style={{
                opacity : 1,
                transform : [{
                    scale : scale
                }]
            }} />
        );
    }
}

export default class BackgroundView extends Component{
    constructor(props){
        super(props);
    }

    render(){
        return (
            <View style={[this.props.style, {
                padding : 0
            }]}>

                {this.props.backgroundImage ?
                    <Image style={{
                        flex: 1,
                        position : 'absolute',
                        height : '100%',
                        width: '100%'
                    }} resizeMode='cover' source={this.props.backgroundImage}/>
                : null}

                {this.props.overlayColor ?
                    <View style={{
                        flex : 1,
                        position :'absolute',
                        height : '100%',
                        width: '100%',
                        backgroundColor : this.props.overlayColor
                    }}></View>   
                : null}
                
                <View style={this.props.style}>
                    {this.props.children}
                </View>

                {this.props.loading ?
                    <View style={{
                        position :'absolute',
                        top : 0,
                        right : 0,
                        bottom : 0,
                        left : 0,
                        alignContent : 'center',
                        justifyContent : 'center',
                        alignItems : 'center',
                        backgroundColor : 'rgba(0, 0, 0, 0.5)'
                    }}>
                        <ActivityIndicator color="#fff" size="large" />
                        {this.props.loadingText ?
                        <Text style={{
                            color : '#ffffff',
                            fontSize : 20
                        }}>{this.props.loadingText}</Text> : null}
                    </View>
                : null}

                {this.props.completed ?
                    <View style={{
                        position :'absolute',
                        top : 0,
                        right : 0,
                        bottom : 0,
                        left : 0,
                        alignContent : 'center',
                        justifyContent : 'center',
                        alignItems : 'center',
                        backgroundColor : 'rgba(0, 0, 0, 0.5)'
                    }}>
                        <CompletedIcon name={this.props.iconName || 'ios-checkmark-circle-outline'} type={this.props.iconType || 'Ionicons'} size={96} color='#ffffff' style={{backgroundColor : 'transparent'}} />
                        <Text style={{
                            color : '#ffffff',
                            fontSize : 24
                        }}>{this.props.completedText || lang('completed')}</Text>
                    </View>
                : null}
            </View>
        );
    }
}