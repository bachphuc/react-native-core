import React, { Component } from 'react';
import {View, Text, Modal, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView} from 'react-native';

import MobiSocket from './MobiSocket';
import CircleImage from './../Components/CircleImage';
import CircleText from './../Components/CircleText';
import ToolBar from './../Components/ToolBar';
import Icon from './../Components/Icon';
import Toast from './../Components/Toast';
import TouchableNativeFeedback from './../Components/TouchableNativeFeedback';
import ActivityIndicator from './../Components/ActivityIndicator';
import BottomBarIphoneX from './../Components/BottomBarIphoneX';

import randomColor from 'randomcolor';

class UserItem extends React.PureComponent{
    _onPress = () => {
        this.props.onPress && this.props.onPress(this.props.user);
    }
    render(){
        let {user} = this.props;
        if(!user.color){
            user.color = randomColor();
        }
        let imageView = user.profile_image ? 
            <CircleImage size={48} resizeMode='cover' source={{uri : MobiSocket.getMessageUserImage(user)}} />
            : <CircleText size={48} length={1} title={user.full_name} color={user.color} />;

            
        return (
            <TouchableNativeFeedback onPress={this._onPress}>
                <View style={styles.item}>
                    {imageView}
                    <Text style={styles.text}>{user.full_name}</Text>
                </View>
            </TouchableNativeFeedback>
        );
    }
}

class Avatar extends React.PureComponent{
    _onPress = () => {
        let {user} = this.props;
        this.props.onPress && this.props.onPress(user);
    }

    render(){
        let {user} = this.props;
        return (
            <TouchableOpacity onPress={this._onPress} >
                {
                    user.profile_image ? 
                    <CircleImage key={user.id} size={40} resizeMode='cover' source={{uri : MobiSocket.getMessageUserImage(user)}} style={{
                        marginLeft : 4,
                        marginRight : 4,
                        marginTop : 8
                    }} />
                    : <CircleText color={user.color} key={user.id} size={40} length={1} title={user.full_name} style={{
                        marginLeft : 4,
                        marginRight : 4,
                        marginTop : 8
                    }} />
                }
            </TouchableOpacity>
        );
    }
}

export default class ModalUsersSelect extends Component {
    constructor(props){
        super(props);

        this.state = {
            selected : [],
            loading : true,
            users : []
        };
    }

    componentDidMount(){
        this._amount = true;
        setTimeout(() => {
            this.setState({
                loading : false,
                users : MobiSocket.getUserList()
            });
        }, 1000);
    }

    componentWillUnmount(){
        this._amount = false;
    }

    _toggle = (user) => {
        let {selected} = this.state;
        let index = selected.indexOf(user);
        if(index === -1){
            selected.push(user);
            this.setState({selected});
        }
        else{
            selected.splice(index, 1);
            this.setState({selected});
        }
    }

    _remove = (user) => {
        let {selected} = this.state;
        let index = selected.indexOf(user);
        if(index !== -1){
            selected.splice(index, 1);
            this.setState({selected});
        }
    }

    _renderItem = (user, index) => {
        return <UserItem key={user.id} user={user} onPress={this._toggle} />
    }

    _submit = () => {
        if(!this.state.selected || !this.state.selected.length) {
            return Toast.show('No users selected.');
        }
        this.props.onSelected && this.props.onSelected(this.state.selected);
    }

    _renderSelectedItem = (user, i) => {
        return <Avatar user={user} key={user.id} onPress={this._remove} />;
    }

    render() {
        let {users} = this.state;
        return (
            <Modal onRequestClose={this.props.onRequestClose} animationType='fade' >
                <SafeAreaView style={{flex : 1}}>
                    <View style={{
                        flex : 1
                    }}>
                        <ToolBar customFont={true} onBack={this.props.onRequestClose} showBackIcon={true} title={'Select Users'} />
                        {!this.state.loading ?
                        <View style={{flex : 1}}>
                            <View style={{
                                flex : 1
                            }}>
                                <ScrollView>
                                    {users.map(this._renderItem)}
                                </ScrollView>
                            </View>
                            <View style={{
                                height : 56,
                                flexDirection : 'row',
                                borderTopColor : '#efefef',
                                borderTopWidth : 1
                            }}>
                                <View style={{
                                    flex : 1
                                }}>
                                    <ScrollView horizontal={true}>
                                        {this.state.selected.map(this._renderSelectedItem)}
                                    </ScrollView>
                                </View>
                                <View>
                                    <TouchableOpacity onPress={this._submit}>
                                        <View style={{
                                            width : 56,
                                            height : 56,
                                            justifyContent : 'center',
                                            alignContent : 'center',
                                            alignItems : 'center'
                                        }}>
                                            <Icon type='FontAwesome' name='send' color='#666666' size={28}  />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <BottomBarIphoneX />
                        </View>
                        : 
                        <View style={{
                            flex : 1, 
                            justifyContent : 'center',
                            alignContent : 'center',
                            alignItems : 'center'
                        }}>
                            <ActivityIndicator size='large' />
                        </View>
                        }
                    </View>
                </SafeAreaView>
            </Modal>
        )
    }
}

var styles = StyleSheet.create({
    item : {
        flexDirection : 'row',
        padding : 8,
        alignItems : 'center'
    },
    text : {
        marginLeft : 8
    }
});