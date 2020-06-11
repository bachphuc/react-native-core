import React, {Component} from 'react';

import {Modal, Text, View} from 'react-native';

import TouchableNativeFeedback from './TouchableNativeFeedback';
import lang from './../lang';

export default class ConfirmBox extends Component{
    constructor(props){
        super(props);
    }

    _onReject = () => {
        if(this.props.onResult){
            this.props.onResult(false);
        }
    }

    _onResolve = () => {
        if(this.props.onResult){
            this.props.onResult(true);
        }
    }

    onRequestClose = () => {
        this.props.onRequestClose && this.props.onRequestClose();
    }

    render(){
        let buttonTextSize = 16;
        let buttonTextColor = '#009688';
        let title = this.props && this.props.params && this.props.params.title ? this.props.params.title : '';
        let message = this.props && this.props.params && this.props.params.message ? this.props.params.message : '';
        return (
            <Modal visible={this.props.visible ? true : false} onRequestClose={this.onRequestClose} transparent={true} animationType='fade'>
                <View style={{
                    flex : 1,
                    backgroundColor : 'rgba(0,0,0,0.5)',
                    alignContent : 'center',
                    justifyContent : 'center',
                    alignItems : 'center'
                }}>
                    <View style={{
                        backgroundColor : '#fff',
                        borderRadius : 4,
                        width: '84%',
                    }}>
                        <View style={{
                            height : 50,
                            paddingLeft : 16,
                            alignItems : 'center',
                            flexDirection : 'row'
                        }}>
                            <Text style={{
                                fontSize : 18,
                                fontWeight : 'bold'
                            }}>{title}</Text>
                        </View>
                        <View style={{
                            paddingLeft : 16,
                            paddingRight : 16
                        }}>
                            <Text style={{
                                fontSize : 16
                            }}>{message}</Text>
                        </View>
                        <View style={{
                            height : 50,
                            flexDirection : 'row',
                            paddingRight : 4,
                            alignItems : 'center',
                            flexDirection : 'row'
                        }}>
                            <View style={{
                                flex : 1
                            }}></View>

                            <TouchableNativeFeedback onPress={this._onReject}>
                                <View style={{
                                    height : 40,
                                    paddingLeft : 16,
                                    paddingRight : 16,
                                    justifyContent : 'center',
                                    alignContent : 'center',
                                    alignItems : 'center',
                                    marginLeft : 8
                                }}>
                                    <Text style={{
                                        fontSize : buttonTextSize,
                                        color : buttonTextColor
                                    }}>{lang('no').toUpperCase()}</Text>
                                </View>
                            </TouchableNativeFeedback>

                            <TouchableNativeFeedback onPress={this._onResolve}>
                                <View style={{
                                    height : 40,
                                    paddingLeft : 16,
                                    paddingRight : 16,
                                    justifyContent : 'center',
                                    alignContent : 'center',
                                    alignItems : 'center',
                                    marginLeft : 8
                                }}>
                                    <Text style={{
                                        fontSize : buttonTextSize,
                                        color : buttonTextColor
                                    }}>{lang('yes').toUpperCase()}</Text>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}