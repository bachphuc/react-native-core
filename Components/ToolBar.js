import React, {Component} from 'react';
import {View, Text, Keyboard, TextInput} from 'react-native';
import {Actions} from 'react-native-router-flux';
import CircleNativeButton from './CircleNativeButton';

import Theme from './../Theme';
import lang from './../lang';

export default class ToolBar extends Component{
    constructor(props){
        super(props);

        this.state = {
            isShowSearch : false,
            text : ''
        };
    }

    componentDidMount = () => {
        this._isAmount = true;
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    }

    componentWillUnmount = () => {
        this._isAmount = false;
        if(this.props.onCloseScreen){
            if(!this.firedOncloseScreen){
                this.props.onCloseScreen();
                this.firedOncloseScreen = true;
            }                
        }
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }   

    _keyboardDidShow = () => {
        this._isShowKeyboard = true;
    }
    
    _keyboardDidHide = () => {
        this._isShowKeyboard = false;
    }

    _onPress = () => {
        if(this._isShowKeyboard){
            return Keyboard.dismiss();
        }
        if(this.props.onPress){
            this.props.onPress();
        }
        else if(this.props.onBack){
            return this.props.onBack();
        }
        else{
            if(this.props.onCloseScreen){
                if(!this.firedOncloseScreen){
                    this.props.onCloseScreen();
                    this.firedOncloseScreen = true;
                }                
            }
            Actions.pop();
            if(this.props.refreshPreviewScreen){

            }
        }
    }

    _showSearch = () => {
        this.setState({isShowSearch : true});
        this.props.onSearchBoxVisibleChanged && this.props.onSearchBoxVisibleChanged(true);
    }

    _hideSearch = () => {
        this.setState({isShowSearch : false});
        this.props.onSearchBoxVisibleChanged && this.props.onSearchBoxVisibleChanged(false);
    }

    getTitle(){
        let {title} = this.props;
        if(!title) return '';
        return typeof title === 'string' ? title : (title.title || title.name || '');
    }

    getSubTitle(){
        let {subTitle} = this.props;
        if(!subTitle) return '';
        return typeof subTitle === 'string' ? subTitle : (subTitle.title || subTitle.name || '');
    }

    _onChangeText = (text) => {
        this.setState({text});
        this.props.onChangeText && this.props.onChangeText(text);
    }

    clear(){
        this.setState({text : ''});
    }

    hideSearch(){
        this.setState({isShowSearch : false});
    }

    showSearch(){
        this.setState({isShowSearch : true});
    }

    _onSearchSubmit = () => {
        this.props.onSearchSubmit && this.props.onSearchSubmit(this.state.text);
    }

    _onSearchRef = (c) => {
        this.searchBox = c;
        if(this.searchBox){
            this.searchBox.focus();
        }
    }

    render(){
        let {ToolBarStyle} = Theme;
        let ToolBarTheme = Theme.getThemeProperty('ToolBarTheme');
        let toolBarStyle = [ToolBarStyle.toolBar];
        let customStyle = {};
        if(this.props.backgroundColor){
            customStyle.backgroundColor = this.props.backgroundColor;
        }

        toolBarStyle.push(customStyle);

        let titleStyle = [ToolBarStyle.toolBarText, this.props.customFont ? ToolBarStyle.title : {}];
        let customTextStyle = {};
        if(this.props.iconColor){
            customTextStyle.color = this.props.iconColor;
        }

        if(this.props.fontSize){
            customTextStyle.fontSize = this.props.fontSize;
        }

        if(this.props.centerTitle){
            customTextStyle.textAlign = 'center';
        }

        titleStyle.push(customTextStyle);

        return (
            <View style={toolBarStyle}>
                {this.props.showBackIcon ?
                    <CircleNativeButton 
                        size={40}
                        onPress={this._onPress}
                        type={this.props.backIconType || 'MaterialIcon'}
                        name={this.props.backIcon || 'arrow-back'}
                        iconColor={this.props.iconColor || ToolBarTheme.TextColor}
                        style={{
                            marginLeft : 8,
                            marginRight : 8
                        }}
                    />
                : null}
                <View style={this.props.showBackIcon ? ToolBarStyle.toolBarContent : [ToolBarStyle.toolBarContent, ToolBarStyle.toolBarContentWithOutBackButton]}>
                    <Text style={titleStyle} numberOfLines={this.props.numberOfLines || undefined}>{this.getTitle()}</Text>
                    {this.props.subTitle ? <Text style={ToolBarStyle.subTitle}>{this.getSubTitle()}</Text> : null}
                </View>

                {this.props.enableSearch ? <CircleNativeButton 
                    size={40}
                    onPress={this._showSearch}
                    type='Ionicons'
                    name='ios-search'
                    iconColor={this.props.iconColor || ToolBarTheme.TextColor}
                    style={{
                        marginLeft : 8,
                        marginRight : 8
                    }}
                /> : null}
                
                {this.props.rightView ?
                    <View style={ToolBarStyle.toolBarRight}>
                        {this.props.rightView}
                    </View>
                : null}
                
                {this.props.enableSearch && this.state.isShowSearch ? <View style={{
                    position : 'absolute',
                    left : 0,
                    top : 0,
                    right : 0,
                    bottom : 0,
                    flexDirection : 'row',
                    backgroundColor : '#ffffff',
                    alignItems : 'center'
                }}>
                    <CircleNativeButton 
                        size={40}
                        onPress={this._hideSearch}
                        type='MaterialIcon'
                        name='arrow-back'
                        iconColor={this.props.iconColor || Theme.primaryIconColor}
                        style={{
                            marginLeft : 8,
                            marginRight : 8
                        }}
                    />

                    <View style={{
                        flex : 1,
                    }}>
                        <TextInput 
                            ref={this._onSearchRef}
                            style={{
                                width : '100%',
                                paddingLeft : 16,
                            }} 
                            underlineColorAndroid='transparent'
                            placeholder={this.props.searchPlaceholder || lang('please_enter_keyword_to_search')}
                            onChangeText={this._onChangeText}
                            value={this.state.text}
                        />
                    </View>

                    <CircleNativeButton 
                        size={40}
                        onPress={this._onSearchSubmit}
                        type='Ionicons'
                        name='ios-search'
                        iconColor={this.props.iconColor || Theme.primaryIconColor}
                        style={{
                            marginLeft : 8,
                            marginRight : 8
                        }}
                    />
                </View>
                : null}
            </View>
        );
    }
}

export const TOOLBAR_HEIGHT = Theme.toolBar.height;