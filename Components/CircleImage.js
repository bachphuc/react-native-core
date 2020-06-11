import React , {Component} from 'react';
import {View} from 'react-native';

import WebImage from 'react-native-awesome-image';
import Api from './../Api';

export default class CircleImage extends Component{

    constructor(props){
        super(props);

        // 0 pending, 1 loaded, 2 failed
        this.state = {
            status : 0
        };
    }

    _onError = (e) => {
        this.setState({
            status: 2
        })
        this.props.onError && this.props.onError(e);
        this.props.onFinished && this.props.onFinished(false, e);
    }

    _onLoad = (e) => {
        this.setState({
            status: 1
        })
        this.props.onLoad && this.props.onLoad(e);
        this.props.onFinished && this.props.onFinished(true, e);
    }

    render(){
        let {source, backgroundColorHolder} = this.props;
        let {status} = this.state;
        if(!source || !source.uri){
            return (
                <View 
                    style={{
                        ...this.props.style,
                        width : this.props.size,
                        height : this.props.size,
                        borderRadius : this.props.size / 2,
                    }}
                />
            );
        }

        let clone = Object.assign({}, source);
        clone.uri = Api.getImage(clone.uri);
        let backgroundColor = backgroundColorHolder ? (status === 0 || status === 2 ? backgroundColorHolder : 'transparent') : 'transparent'

        return (
            <WebImage resizeMode='cover' source={clone} borderRadius={this.props.size} style={{
                backgroundColor : backgroundColor,
                ...this.props.style,
                width : this.props.size,
                height : this.props.size,
                borderRadius : this.props.size / 2,
            }} onError={this._onError} onLoad={this._onLoad} />
        );
    }
}