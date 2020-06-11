import React from 'react';
import {TouchableNativeFeedback as TNativeFeedback} from 'react-native';

export default class TouchableNativeFeedback extends React.PureComponent{
    render(){
        return (
            <TNativeFeedback {...this.props} />
        );
    }
}