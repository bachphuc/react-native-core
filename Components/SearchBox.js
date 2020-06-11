import React, { Component } from 'react';
import {View, TextInput, TouchableOpacity} from 'react-native';

import Icon from './Icon';
import lang from './../lang';

import PropTypes from 'prop-types';

export default class SearchBox extends Component {
    constructor(props){
        super(props);

        this.state = {
            value : ''
        };
    }

    componentDidMount(){
        this._amount = true;
    }

    componentWillUnmount(){
        this._amount = false;
    }

    _onPress = () => {
        this.props.onSearch && this.props.onSearch(this.state.value);
    }

    _onChangeText = (value) => {
        if(!this._amount) return;
        this.setState({value});
    }

    focus(){
        this.textInput && this.textInput.focus();
    }

    _textInputRef = (c) => {
        this.textInput = c;
    }
    
    render() {
        return (
            <View style={this.props.style}>
                <View style={{
                    height : 48,
                    flexDirection : 'row',
                    backgroundColor : '#ffffff',
                    marginTop : 1
                }}>

                    <View style={{
                        flex : 1,
                    }}>
                        <TextInput style={{
                            flex : 1,
                            height : 40,
                            paddingLeft : 16
                        }} 
                            ref={this._textInputRef}
                            underlineColorAndroid='transparent' 
                            placeholder={this.props.placeholder || lang('enter_something_to_search')} 
                            onChangeText={this._onChangeText}
                            value={this.state.value}
                            returnKeyType='search'
                            onSubmitEditing={this._onPress}
                        />
                    </View>
                    
                    <TouchableOpacity onPress={this._onPress} style={{
                        width: 48,
                        height : 48,
                        justifyContent : 'center',
                        alignContent : 'center',
                        alignItems : 'center'
                    }}>
                        <Icon type='EvilIcons' name='search' size={24} color='#999999' />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

SearchBox.propTypes = {
    onSearch: PropTypes.func,
};