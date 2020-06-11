import React, { Component } from 'react';
import {View, Text} from 'react-native';

import CircleImage from './CircleImage';
import CircleText from './CircleText';

export default class AvatarImage extends React.PureComponent {
    constructor(props){
        super(props);

        // 0 pending, 1 loaded, 2 failed
        this.state = {
            status : 0
        };
    }

    _onFinished = (status, e) => {
        if(status){
            this.setState({
                status: 1
            })
        }
        else{
            this.setState({
                status: 2
            })
        }
    }

    render() {
        let {status} = this.state;
        if(this.props.source && this.props.source.uri && (status === 0 || status === 1)){
            return (
                <CircleImage 
                    {...this.props}
                    onFinished={this._onFinished}
                />
            );
        }
        return (
            <CircleText 
                {...this.props}
            />
        );
    }
}
