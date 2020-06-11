import React from 'react';

import {View, Text} from 'react-native';
import randomColor from 'randomcolor';

export default class CircleText extends React.PureComponent{
    constructor(props){
        super(props);
    }

    getText(){
        if(!this.props.title) return '';
        let title = this.props.title;
        if(typeof title !== 'string'){
            title = title.toString();
        }
        let parts = title.toUpperCase().split(' ');
        let length = this.props.length || 1;
        let i = 0;
        let cs = [];
        parts.forEach(t => {
            if(i < length){
                cs.push(t[0]);
            }
            i++;
        });
        return cs.join('');
    }
    
    getColor(){
        if(this.props.color) return this.props.color;
        if(this.color) return this.color;
        this.color = randomColor();
        return this.color;
    }

    render(){
        return (
            <View style={{
                ...this.props.style,
                backgroundColor : this.getColor(),
                width : this.props.size,
                height : this.props.size,
                justifyContent : 'center',
                alignContent : 'center',
                alignItems : 'center',
                borderRadius : this.props.square ? 0 : this.props.size / 2,
            }}>
                <Text style={{
                    color : '#ffffff', 
                    fontSize : this.props.textSize || 20
                }}>{this.getText()}</Text>
            </View>
        );
    }
}

