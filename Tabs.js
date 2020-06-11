import React, { Component } from 'react';
import { StyleSheet, Text,  TouchableOpacity, View } from 'react-native';

import Theme from './Theme';
import Icon from './Components/Icon';

export const TabStyle = StyleSheet.create({
     content: {
        flex: 1
    }    
});

export default class Tabs extends Component {

    // initial tab: int
    // reloadTab : boolean
    // onTabSelected : function
    // hideTabContent : boolean
    // tabAtBottom : boolean
    // customActiveTabStyle: style
    // getActiveTabStyle: func
    // customTabStyle: style
    // getTabStyle: func
    // tabType: string |icon|text|both
    // hideTabBar: boolean, default false

    constructor(props) {
        super(props);
        this.contents = {};
        this.tabTexts = {};
        this.tabIcons = {};
        this.tabContainers = {};

        // Initialize State
        this.state = {
            // First tab is active by default
            activeTab: props.initialTab || 0
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.state.activeTab != nextState.activeTab){
            return true;
        }
        if(this.props.refresh != nextProps.refresh){
            return true;
        }
        return false;
    }

    selectTab(index){
        this.tabItemClick(index);
    }

    next(){
        const next = this.state.activeTab + 1;
        if(!this.contents[next]) {
            return;
        }
        this.selectTab(next);
    }

    prev(){
        const prev = this.state.activeTab - 1;
        if(prev < 0) return;
        this.selectTab(prev);
    }

    tabItemClick(index){
        if(this.props.onTabClick){
            let result = this.props.onTabClick(index);
            if(result === false) return;
        }

        if(index == this.state.activeTab) {
            if(this.props.onActiveTabClick){
                this.props.onActiveTabClick(index);
            }
            return;
        }
        if(this.props.reloadTab){
            this.setState({activeTab : index});
            if(this.props.onTabSelected){
                this.props.onTabSelected(index, this.props.children[index]);
            }
            return;
        }
        this.state.activeTab = index;

        let {TabStyle} = Theme;
        let TabTheme = Theme.getThemeProperty('TabTheme');
        for(let k in this.contents){
            if(k != index){
                if(this.contents[k]){
                    this.contents[k].setNativeProps({style :TabStyle.nothing}) ;
                }
                if(this.tabTexts[k]){
                    this.tabTexts[k].setNativeProps({style : TabStyle.tabText});
                }
                if(this.tabIcons[k]){
                    this.tabIcons[k].setNativeProps({style : {color : TabTheme.TabsDefaultTextColor}});
                }
                if(this.tabContainers[k]){
                    this.tabContainers[k].setNativeProps({style : this.getTabStyle(k)});
                }
            }
        }
        if(this.tabTexts[index]){
            this.tabTexts[index].setNativeProps({style : TabStyle.tabTextActive});
        }

        if(this.tabIcons[index]){
            this.tabIcons[index].setNativeProps({style : {color : TabTheme.TabsActiveTextColor}});
        }
        
        if(this.contents[index]){
            this.contents[index].setNativeProps({style : TabStyle.contentContainerActive});
        }
        if(this.tabContainers[index]){
            this.tabContainers[index].setNativeProps({style : this.getActiveTabStyles(index)});
        }
        
        if(this.props.onTabSelected){
            this.props.onTabSelected(index, this.props.children[index]);
        }
    }

    getTabStyle(index){
        let {TabStyle} = Theme;

        let s = [TabStyle.tabContainer];
        if(this.props.customTabStyle){
            s.push(this.props.customTabStyle);
        }
        if(this.props.getTabStyle){
            let t = this.props.getTabStyle(index);
            if(t){
                s.push(t);
            }
        }
        return s;
    }
    
    getActiveTabStyles(index){
        let {TabStyle} = Theme;

        let s = [TabStyle.tabContainer, TabStyle.tabContainerActive];

        if(this.props.customActiveTabStyle){
            s.push(this.props.customActiveTabStyle);
        }
        if(this.props.getActiveTabStyle){
            let t = this.props.getActiveTabStyle(index);
            if(t){
                s.push(t);
            }
        }

        return s;
    }

    _renderContent(children){
        let {TabStyle} = Theme;

        if(this.props.reloadTab){
            if(this.props.hideTabContent){
                return children[this.state.activeTab];
            }
            else{
                return (
                    <View style={TabStyle.contentContainer}>
                        {children[this.state.activeTab]}
                    </View>
                );
            }
        }
        else{
            if(this.props.hideTabContent){
                return null;
            }
            else{
                return (
                    <View style={TabStyle.contentContainer}>
                        {children.map((childItem, index) => {
                            if(!childItem) return null;
                            let {title} = childItem.props;
                            return <View ref={component => this.contents[index] = component} key={index} style={this.state.activeTab == index ? TabStyle.contentContainerActive : TabStyle.nothing}>
                            {children[index]}
                            </View>
                        })}
                    </View>
                );
            }
        }
    }

    renderIcon(index, type, name, iconSize){
        let {TabStyle} = Theme;
        let TabTheme = Theme.getThemeProperty('TabTheme');

        let color = this.state.activeTab == index ? TabTheme.TabsActiveTextColor : TabTheme.TabsDefaultTextColor;
    
        return <Icon type={type} ref={component => this.tabIcons[index] = component} name={name} size={iconSize} color={color} captureRefEvent={true} />;
    }

    renderTabText(index, title){
        let {TabStyle} = Theme;
        let TabTheme = Theme.getThemeProperty('TabTheme');

        let style = [this.state.activeTab == index ? TabStyle.tabTextActive : TabStyle.tabText];
        if(this.props.textSize){
            style.push({
                fontSize : this.props.textSize
            });
        }
        return (
            <Text ref={component => this.tabTexts[index] = component} style={style}>
                {title}
            </Text>
        );
    }

    renderTabItem(index, title, icon, tabIconType, hideTab){
        if(hideTab) return null;
        let tabType = this.props.tabType || 'text';
        let iconType = tabIconType || this.props.iconType || 'MaterialIcons';

        let {TabStyle} = Theme;

        let iconSize = this.props.iconSize || 24;
        if(tabType == 'text'){
            return this.renderTabText(index, title);
        }
        else if(tabType == 'icon'){
            return (
                <View style={{
                    alignContent: 'center',
                    justifyContent : 'center',
                    alignItems : 'center',
                    flex : 1
                }}>
                    {this.renderIcon(index, iconType, icon, iconSize)}
                </View>
            );
        }

        return (
            <View style={{
                alignContent: 'center',
                justifyContent : 'center',
                alignItems : 'center'
            }}>
                {this.renderIcon(index, iconType, icon, iconSize)}  
                {this.renderTabText(index, title)}
                
            </View>
        );
    }

    _renderTabs(children, position){
        let {hideTabBar} = this.props;
        if(hideTabBar) return null;
        if(this.props.tabAtBottom && position != 'bottom') {
            return null;
        }
        else if(!this.props.tabAtBottom && position != 'top') {
            return null;
        }

        let {TabStyle} = Theme;

        return (
            <View style={TabStyle.tabsContainer}>
            {/* Pull props out of children, and pull title out of props */}
            {children.map((childItem, index) => {
                if(!childItem) return null;
                let { title , icon, iconType, hideTab} = childItem.props;

                let tabContainerStyles = index == this.state.activeTab ? this.getActiveTabStyles(index) : this.getTabStyle(index);
                return ( hideTab ? null :
                    <TouchableOpacity
                        ref={c => this.tabContainers[index] = c} 
                        style={tabContainerStyles}
                        // Change active tab
                        onPress={() => this.tabItemClick(index) }
                        // Required key prop for components generated returned by map iterator
                        key={index}
                        >
                        {this.renderTabItem(index, title, icon, iconType, hideTab)}
                    </TouchableOpacity>
                )
            }
            )}
            </View>
        );
    }

    // Pull children out of props passed from App component
    render({ children } = this.props) {
        let {TabStyle} = Theme;
        return (
            <View style={this.props.hideTabContent ? TabStyle.containerWithOutContent : TabStyle.container}>

                {/* Tabs row */}
                {this._renderTabs(children, 'top')}

                {/* Content */}
                {this._renderContent(children)}

                {this._renderTabs(children, 'bottom')}
            </View>
        );
    }
}