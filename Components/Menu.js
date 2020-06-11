import React, {Component} from 'react';
import {StyleSheet, View, Text} from 'react-native';

import Icon from './Icon';
import TouchableNativeFeedback from './TouchableNativeFeedback';
import Navigator from 'app/Navigator';


class MenuItem extends React.PureComponent{
    _onPress = () => {
        this.props.onPress && this.props.onPress(this.props.menu);
    }

    render(){
        const {menu} = this.props;
        return (
            <TouchableNativeFeedback onPress={this._onPress}>
                <View style={styles.menuItem}>
                    <Icon type={menu.iconType} style={styles.menuItemIcon} name={menu.icon} size={MENU_ICON_SIZE} />
                    <Text style={styles.menuItemText}>{menu.title}</Text>
                </View>
            </TouchableNativeFeedback>
        );
    }
}

export default class Menu extends Component{
    constructor(props){
        super(props);
    }

    _onMenuItemClick = (menu) => {
        if(menu.page && menu.action){
            Navigator.open(menu.action);
            return;
        }
        this.props.onMenuItemClicked && this.props.onMenuItemClicked(menu);
    }

    _renderItem = (e, i) => {
        return <MenuItem key={i} onPress={this._onMenuItemClick} menu={e} />;
    }

    render() {
        const {menus} = this.props;
        if(!menus || !menus.length) return null;

        return (
            <View>
                {menus.map(this._renderItem)}
            </View>
        );
    }
}

const MENU_ICON_SIZE = 24;
var styles = StyleSheet.create({
    menuItem : {
        padding : 8,
        flexDirection : 'row',
        alignItems : 'center',
        borderBottomColor : '#efefef',
        borderBottomWidth : 1
    },
    menuItemIcon : {
        marginRight : 16,
        marginLeft : 8
    },
    menuItemText : {

    }
});