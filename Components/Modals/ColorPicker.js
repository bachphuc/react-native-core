import React, { Component } from 'react';
import {View, Text, Modal, TouchableOpacity} from 'react-native';

import ColorUtils from './../../ColorUtils';

const colors = new ColorUtils.Rainbow({length : 36});
import lang from './../../lang';

class ColorItem extends React.PureComponent{
    _onPress = () => {
        let {color} = this.props;
        this.props.onPress && this.props.onPress(color);
    }

    render(){
        let {color} = this.props;
        return (
            <TouchableOpacity onPress={this._onPress}>
                <View style={{
                margin : 8,
                width : 24,
                height : 24,
                backgroundColor : color
            }}/>
            </TouchableOpacity>
        );
    }
}

export default class ColorPicker extends Component {
    _onPress = (color) => {
        this.props.onColorSelected && this.props.onColorSelected(color);
    }

    _renderItem = (c) => {
        return <ColorItem key={c} color={c} onPress={this._onPress} />
    }

    _onRequestClose = () => {
        this.props.onRequestClose && this.props.onRequestClose();
    }

    render() {
        return (
            <Modal onRequestClose={this._onRequestClose} animationType='fade' transparent={true} visible={this.props.visible} >
                <View style={{
                    flex : 1,
                    justifyContent : 'center',
                    alignContent : 'center',
                    alignItems : 'center',
                    padding : 8,
                    backgroundColor : 'rgba(0, 0, 0, 0.7)'
                }}>
                    <View style={{
                        width : 240,
                        backgroundColor : '#ffffff'
                    }}>
                        <View style={{
                            flexDirection : 'row',
                            flexWrap: 'wrap',
                        }}>
                            {colors.map(this._renderItem)}
                        </View>

                        <TouchableOpacity onPress={this._onRequestClose} >
                            <View style={{
                                height : 40,
                                backgroundColor : '#efefef',
                                justifyContent : 'center',
                                alignContent : 'center',
                                alignItems : 'center',
                            }}>
                                <Text>{lang('cancel')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }
}
