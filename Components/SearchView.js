import React, { Component } from 'react';
import {View, Text, TouchableOpacity, TextInput, StyleSheet, Keyboard} from 'react-native';
import Icon from './Icon';
import lang from './../lang';
import {Log} from './../Utils';
import Platform from './Platform';
import CircleNativeButton from './CircleNativeButton';

export class SearchViewResult extends Component{
    constructor(props){
        super(props);
        this.state = {
            isSearching : false,
        };
    }

    render(){
        return (
            <View style={this.state.isSearching ? styles.searchBox : [styles.searchBox, styles.hideSearchBox]}>
                {this.props.children ? this.props.children : null}
            </View>
        );
    }
}

export default class SearchView extends Component {
    constructor(props){
        super(props);
        this.state = {
            isSearching : false,
            keyword : '',
            searchText : '',
        };
    }

    setView(view){
        this.searchViewResult = view;
    }

    componentDidMount = () => {
        this._amount = true;
        // init keyboard events
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    }

    componentWillUnmount = () => {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();

        this._amount = false;
    }

    onFocusSearchBox = () => {
        Log('onFocusSearchBox');
        this.setState({isSearching : true});
        if(this.searchViewResult){
            this.searchViewResult.setState({isSearching : true});
        }
    }

    toggleSearch = () => {
        let isSearching = this.state.isSearching;
        let bTmp = !this.state.isSearching;
        this.setState({isSearching : bTmp});
        if(this.searchViewResult){
            this.searchViewResult.setState({isSearching : bTmp});
        }
        if(isSearching){
            // hide keyboards if user click back on search box
            Keyboard.dismiss();
        }
    }

    _keyboardDidShow = () => {
        if(!this._amount) return;
        Log('_keyboardDidShow');
    }
    
    _keyboardDidHide = () => {
        if(!this._amount) return;
        Log('_keyboardDidHide');
        if(this.searchBox && this.searchBox.isFocused()){
            this.searchBox.blur();
        }
        if(!this.state.keyword && this.state.isSearching){
            this.setState({isSearching : false});
            if(this.searchViewResult){
                this.searchViewResult.setState({isSearching : false});
            }
        }   
    }

    onSearchBoxChangeText = (text) => {
        this.setState({searchText : text});
        if(this.searchBoxTimer){
            clearTimeout(this.searchBoxTimer);
        }
        this.searchBoxTimer = setTimeout(() => {
            this.setState({keyword : this.state.searchText});
            // update keyword for searchViewResult
            if(this.props.onSearchChanged){
                this.props.onSearchChanged(this.state.searchText);
            }
        }, 1000);
    }

    render() {
        let {iconType, iconName} = this.props;

        let searchIconName = iconName || 'magnifier';
        let searchIconType = iconType || 'SimpleLineIcons';
        return (
            <View style={{
                padding : 8,
                backgroundColor : this.props.backgroundColor || '#333333'
            }}> 
                <View style={{
                    backgroundColor : '#ffffff',
                    flexDirection : 'row',
                    borderRadius : 4
                }}>  
                    {this.props.leftView ? this.props.leftView : null}

                    <CircleNativeButton 
                        size={SEARCH_BUTTON_SIZE}
                        onPress={this.toggleSearch}
                        type={searchIconType}
                        name={this.state.isSearching ? 'arrow-left' : searchIconName}
                        iconSize={SEARCH_ICON_SIZE}
                    />

                    <View style={{
                        flex : 1,
                        flexDirection : 'row'
                    }}>
                        <TextInput style={{
                            flex : 1,
                            height : 40
                        }} 
                            ref={c => this.searchBox = c}
                            underlineColorAndroid='transparent' 
                            placeholder={this.props.placeholder || lang('default_search_placeholder')} 
                            onFocus={this.onFocusSearchBox} 
                            onChangeText={(text) => this.onSearchBoxChangeText(text)}
                            value={this.state.searchText}
                        />
                    </View>
                    {this.props.rightView ? <View style={styles.rightView}>
                        {this.props.rightView}
                    </View> : null}
                </View>
            </View>
        );
    }
}

const SEARCH_ICON_SIZE = 24;
const SEARCH_BUTTON_SIZE = 40;
var styles = StyleSheet.create({
    searchBox : {
        position : 'absolute',
        left : 0,
        top : 56,
        right : 0,
        bottom : 0,
        backgroundColor : 'rgba(255, 255, 255, 1)',
        paddingTop : 4,
        paddingBottom : 4
    },
    hideSearchBox : {
        height : 0,
        opacity : 0,
        overflow : 'hidden',
        padding : 0
    },
    searchButton : {
        height : SEARCH_BUTTON_SIZE,
        width : SEARCH_BUTTON_SIZE,
        justifyContent : 'center',
        alignContent : 'center',
        alignItems : 'center'
    },
    rightView : {

    }
});

SearchView.Style = {
    SearchButton : styles.searchButton
};

SearchView.SEARCH_ICON_SIZE = SEARCH_ICON_SIZE;
SearchView.SEARCH_BUTTON_SIZE = SEARCH_BUTTON_SIZE;