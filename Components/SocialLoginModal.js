import React, { Component } from 'react';
import {View, Text, Modal, StyleSheet, TouchableOpacity} from 'react-native';
import Spinner from 'react-native-spinkit';
import lang from './../lang';
import Icon from './Icon';
import SocialLogin from './../SocialLogin';

import Authentication from './../Authentication';

import {Log} from './../Utils';
import Toast from './Toast';

export class SocialComponent extends Component{
    constructor(props){
        super(props);
        this.state = {
            isLogging : false
        };
    }

    loginWithGoogle = () => {
        this.setState({isLogging : true});
        SocialLogin.loginGoogle().then(this.loginSuccess)
        .catch(this.loginFailed);
    }

    loginWithFacebook = () => {
        this.setState({isLogging : true});
        SocialLogin.loginFacebook().then(this.loginSuccess)
        .catch(this.loginFailed);
    }

    loginSuccess = (response) => {
        Log(response);
        this.setState({isLogging : false});
        if(response && response.data){
            let data = response.data;
            if(data.status){
                Authentication.setToken(data.token);
                Authentication.setUser(data.user);
                Authentication.saveAuthentication();
                if(this.props.onLogin){
                    this.props.onLogin();
                }
            }
        }
    }

    loginFailed = (err) => {
        this.setState({isLogging : false});
        Log('SocialLoginModal > failed');
        Log(err);
        if(!err) return Toast.show(lang('something_was_wrong'));
        if(typeof err === 'string'){
            Toast.show(err);
        }
        else{
            Toast.show(err.err || err.error || err.message || lang('something_was_wrong'));
        }
    }

    renderLoading(){
        if(!this.state.isLogging) return null;
        return (
            <View style={{
                alignContent : 'center',
                alignItems : 'center',
                justifyContent : 'center',
                position : 'absolute',
                top : 0, 
                right : 0,
                bottom : 0,
                left : 0,
                backgroundColor : 'rgba(0, 0, 0, 0)'
            }}>
                <Spinner type='Circle' color='#666666' /> 
            </View>
        );
    }

    render(){
        return (
            <View>
                <TouchableOpacity onPress={this.loginWithFacebook}>
                    <View style={[styles.shareButton, styles.facebookBtn]}>
                        <Icon size={32} type='MaterialCommunityIcons' name='facebook' color='#ffffff' />
                        <Text style={styles.loginBtnText}>{lang('login_with_facebook')}</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={this.loginWithGoogle}>
                    <View style={[styles.shareButton, styles.googleBtn]}>
                        <Icon size={32} type='MaterialCommunityIcons' name='google' color='#ffffff' />
                        <Text style={styles.loginBtnText}>{lang('login_with_google')}</Text>
                    </View>
                </TouchableOpacity>

                {this.renderLoading()}
            </View>
        );
    }
}

export default class SocialLoginModal extends Component {
    constructor(props){
        super(props);
        this.state = {
            isLogin : false
        };
    }

    canShow(){
        let bShow = this.props && this.props.visible && !Authentication.isUser() ? true : false;
        Log('canShow ' + bShow + ', props visible ' + this.props.visible + ', isUser ' + Authentication.isUser());
        return bShow;
    }

    onRequestClose = () => {
        if(this.props.onRequestClose){
            this.props.onRequestClose();
        }
    }

    onLogin = () => {
        this.setState({isLogin : true});
    }

    render() {
        return (
            <Modal visible={this.canShow()} onRequestClose={this.onRequestClose}
                    transparent={true}
                >
                <View style={styles.modalLogin}>
                    <View style={styles.loginModalContent}>
                        <View style={styles.modalHeader}>   
                            <Text style={styles.headerTitle}>{lang('login')}</Text>
                        </View>
                        
                        <SocialComponent onLogin={this.onLogin} />

                        <TouchableOpacity onPress={this.onRequestClose} style={styles.closeBtn}>
                            <Icon name='close' size={24} color='#333333' />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }
}

var styles =StyleSheet.create({
    closeBtn : {
        height : 48,
        width : 48,
        justifyContent : 'center',
        alignContent : 'center',
        alignItems : 'center',
        position : 'absolute',
        right : 0,
        top : 0
    },
    headerTitle : {
        fontSize : 20
    },
    shareButton : {
        height : 50,
        borderRadius: 25,
        alignItems : 'center',
        justifyContent : 'center',
        alignContent : 'center',
        flexDirection : 'row'
    },
    loginModalContent : {
        paddingRight : 16,
        paddingBottom : 16,
        paddingLeft : 16,
        backgroundColor : '#ffffff',
        borderRadius : 4,
        width : '80%'
    },
    googleBtn : {
        backgroundColor : '#f44336'
    },
    facebookBtn : {
        backgroundColor : '#1e88e5',
        marginBottom : 16,
    },
    modalLogin : {
        flex : 1,
        alignItems : 'center',
        justifyContent : 'center',
        alignContent : 'center',
        backgroundColor : 'rgba(0, 0, 0, 0.7)'
    },
    loginBtnText : {
        color : '#ffffff',
        fontSize : 16,
        marginLeft : 8
    },
    modalHeader : {
        height : 48,
        justifyContent : 'center',
        alignContent : 'center',
        alignItems : 'center'
    }
});