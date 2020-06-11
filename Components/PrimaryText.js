import React from 'react';
import {Text} from 'react-native';
import Theme from './../Theme';

export default function PrimaryText(props){
    let {style, children, ...rest} = props;

    let customStyle = [style, {
        color: Theme.primaryColor
    }]
    return (
        <Text style={customStyle} {...rest}>{children}</Text>
    )
}