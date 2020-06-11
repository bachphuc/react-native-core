import React, {Component} from 'react';

import {Modal, Text, View, TextInput} from 'react-native';

import TouchableNativeFeedback from './TouchableNativeFeedback';
import Form from './Form';

import Toast from './Toast';

export default class ModalInput extends Component{
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
            let errors = this.form.getErrors();
            if(!errors){
                this.props.onResult(true, this.form.getData());
            }
            else{
                Toast.show(errors[0]);
            }
        }
    }

    onRequestClose = () => {
        this.props.onRequestClose && this.props.onRequestClose();
    }

    render(){
        if(!this.props || !this.props.params || !this.props.params.fields) return null;

        let buttonTextSize = 18;
        let buttonTextColor = '#009688';
        let {fields, title} = this.props.params;

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
                            {title ? <Text style={{
                                fontSize : 20,
                                fontWeight : 'bold'
                            }}>{title}</Text> : null}
                        </View>
                        <View style={{
                            paddingLeft : 16,
                            paddingRight : 16
                        }}>
                            <Form ref={c => this.form = c} fields={this.props.params.fields} />
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
                                    }}>NO</Text>
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
                                    }}>YES</Text>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}