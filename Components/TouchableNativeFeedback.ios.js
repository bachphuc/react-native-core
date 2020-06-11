import React, {Component} from 'react';
import {TouchableOpacity as TNativeFeedback} from 'react-native';

export default class TouchableNativeFeedback extends Component{
    render(){
        return (
            <TNativeFeedback {...this.props} />
        );
    }
}