import { StyleSheet, StatusBar} from 'react-native';

import Platform from './Components/Platform';

import Gate from './Gate';
import {Log} from './Utils';
import ColorUtils from './ColorUtils';

var primaryColor = '#ffffff';
var primaryIconColor = '#333333';
var primaryTextColor = '#444444';

const ToolBarHeight = 50;

var styles = StyleSheet.create({
    toolBar: {
        height: ToolBarHeight,
        backgroundColor: primaryColor,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 0,
        marginTop: Platform.OS === 'android' ? 0 : (Platform.isIphoneX() ? 44 : 20)
    },
    toolBarText: {
        color: primaryTextColor,
        marginRight: 8,
    },
    backButton: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center'
    },
    toolBarButton: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center'
    },
    toolBarContentWithOutBackButton: {
        marginLeft: 16
    },
    toolBarContent: {
        flex: 1
    },
    toolBarRight: {
        marginRight: 0
    },
    backIcon: {
        marginRight: 8
    },
});

export const FormStyle = {
    TextInputStyle: {
        activeBorderColor: 'green',
        borderColor: '#cccccc',
        inputHeight: 44
    }
};

const CHAT_STYLE_DEFAULT = {
    FRIEND: {
        BG_COLOR: '#4CAF50',
        TEXT_COLOR: '#ffffff',
        LINK: {
            LINK_TITLE_COLOR: '#ffffff',
            LINK_DESC_COLOR: '#eeeeee'
        }
    },
    ME: {
        BG_COLOR: '#fefefe',
        TEXT_COLOR: '#444444',
        LINK: {
            LINK_TITLE_COLOR: '#444444',
            LINK_DESC_COLOR: '#666666'
        }
    }
};

const DEFAULT_THEME = {
    statusBarStyle : 'light-content',
    primaryColor: primaryColor,
    secondPrimaryColor : primaryColor,
    primaryIconColor: primaryIconColor,
    primaryTextColor: primaryTextColor,
    secondPrimaryTextColor : primaryTextColor,
    CHAT_STYLE: CHAT_STYLE_DEFAULT,
    ToolBarHeight: ToolBarHeight,
    ToolBarTheme: {
        ToolBarHeight: ToolBarHeight,
        TextColor: primaryTextColor,
        SubTitleColor : primaryTextColor
    },
    TabTheme : {
        TabsDefaultTextColor: '#999999',
        TabsActiveTextColor: primaryIconColor,
        TabsActiveBorderColor: 'rgba(255, 255, 255, 0.8)',
        TabsBackgroundColor: primaryColor,
        TabsBackgroundActiveColor: 'rgba(255, 255, 255, 0.1)'
    }
}

function getThemeProperty(theme, key) {
    return theme[key] !== undefined ? theme[key] : DEFAULT_THEME[key];
}

function generateStyles(theme) {
    if (!theme) {
        theme = DEFAULT_THEME;
    }

    let primaryColor = getThemeProperty(theme, 'primaryColor');
    let statusBarStyle = getThemeProperty(theme, 'statusBarStyle');
    let STATUS_BAR_COLOR = ColorUtils.darker(0.2, primaryColor);
    if(Platform.OS === 'android'){
        // set status bar background color for android
        StatusBar.setBackgroundColor(STATUS_BAR_COLOR);
    }
    else{
        // set status bar style for IOS
        StatusBar.setBarStyle(statusBarStyle, true);
    }

    let primaryIconColor = getThemeProperty(theme, 'primaryIconColor');
    let primaryTextColor = getThemeProperty(theme, 'primaryTextColor');
    let secondPrimaryColor = getThemeProperty(theme, 'secondPrimaryColor');
    let secondPrimaryTextColor = getThemeProperty(theme, 'secondPrimaryTextColor');

    let CHAT_STYLE = getThemeProperty(theme, 'CHAT_STYLE');
    let ToolBarTheme = getThemeProperty(theme, 'ToolBarTheme');

    let {
        ToolBarHeight
    } = ToolBarTheme;

    let TabTheme = getThemeProperty(theme, 'TabTheme');

    return {
        primaryColor: primaryColor,
        primaryIconColor: primaryIconColor,
        primaryTextColor: primaryTextColor,
        secondPrimaryColor: secondPrimaryColor,
        secondPrimaryTextColor: secondPrimaryTextColor,
        progressBarColor: '#999999',
        tabs: {
            TabsDefaultTextColor: '#999999',
            TabsActiveTextColor: primaryIconColor,
            TabsActiveBorderColor: 'rgba(255, 255, 255, 0.8)',
            TabsBackgroundColor: primaryColor,
            TabsBackgroundActiveColor: 'rgba(255, 255, 255, 0.1)'
        },
        toolBar: {
            height: ToolBarHeight
        },
        styles: styles,
        CHAT_STYLE: CHAT_STYLE,
        ToolBarStyle: {
            height: ToolBarHeight,
            toolBar: {
                height: ToolBarHeight,
                backgroundColor: primaryColor,
                flexDirection: 'row',
                alignItems: 'center',
                elevation: 0,
            },
            toolBarText: {
                color: ToolBarTheme.TextColor,
                marginRight: 8,
            },
            backButton: {
                width: 48,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center'
            },
            toolBarButton: {
                width: 48,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center'
            },
            toolBarContentWithOutBackButton: {
                marginLeft: 16
            },
            toolBarContent: {
                flex: 1
            },
            toolBarRight: {
                marginRight: 0
            },
            backIcon: {
                marginRight: 8
            },
            title: {
                fontSize: 20,
                fontFamily: 'DancingScript-Bold',
            },
            subTitle: {
                fontSize: 10,
                color: ToolBarTheme.SubTitleColor || ToolBarTheme.TextColor,
            }
        },
        TabStyle: {
            // Component container
            containerWithOutContent: {
                height: 53,
            },
            container: {
                flex: 1, // Take up all available space
            },
            // Tabs row container
            tabsContainer: {
                flexDirection: 'row', // Arrange tabs in a row
                backgroundColor: TabTheme.TabsBackgroundColor,
                height: ToolBarHeight
            },
            // Individual tab container
            tabContainer: {
                flex: 1, // Take up equal amount of space for each tab
                paddingVertical: 15, // Vertical padding
                borderBottomWidth: 3, // Add thick border at the bottom
                borderBottomColor: 'transparent', // Transparent border for inactive tabs
                backgroundColor: 'transparent'
            },
            // Active tab container
            tabContainerActive: {
                borderBottomColor: TabTheme.TabsActiveBorderColor, // White bottom border for active tabs
                backgroundColor: TabTheme.TabsBackgroundActiveColor
            },
            // Tab text
            tabText: {
                color: TabTheme.TabsDefaultTextColor,
                fontFamily: 'Avenir',
                fontWeight: 'bold',
                textAlign: 'center',
            },
            tabTextActive: {
                color: TabTheme.TabsActiveTextColor,
                fontFamily: 'Avenir',
                fontWeight: 'bold',
                textAlign: 'center',
            },
            // Content container
            contentContainer: {
                flex: 1,
                backgroundColor: '#fff'
            },
            contentContainerActive: {
                flex: 1,
                opacity: 1
            },
            nothing: {
                flex: 0,
                height: 0,
                opacity: 0
            }
        }
    }
}

class ThemeService {
    theme = null;
    themeStyles = {};

    constructor() {
        this.generateStyles(DEFAULT_THEME);
    }

    getTheme() {
        return this.theme;
    }

    getRemoteTheme() {
        return new Promise((resolve, reject) => {
            let isResolve = false;
            Gate.getApiCache('theme', (data) => {
                Log('Theme > onLoadThemeFromCacheSuccess');
                if(data && data.theme){
                    this.cacheTheme = data;
                    if(!isResolve){
                        this.generateStyles(data.theme);
                        resolve(data);
                        isResolve = true;
                    }
                }
            }).then(data => {
                Log('Theme > getRemoteTheme > success');
                if(isResolve) return;
                if (data.status && data.theme) {
                    this.generateStyles(data.theme);
                    resolve(data);
                    isResolve = true;
                }
                else{
                    if(this.cacheTheme){
                        resolve(this.cacheTheme);
                    }
                    else{
                        reject({error : 'No theme found on server.'});
                    }
                }
            })
            .catch(err => {
                Log('Theme > getRemoteTheme > error');
                Log(err);
                if(isResolve) return;
  
                if(this.cacheTheme && this.cacheTheme.theme){
                    this.generateStyles(this.cacheTheme.theme);
                    resolve(this.cacheTheme);
                }
                else{
                    reject(err);
                }
   
            });
        });
    }

    generateStyles(theme) {
        this.theme = theme;
        this.themeStyles = generateStyles(this.theme);
        for (let k in this.themeStyles) {
            if(k !== 'primaryColor'){
                this[k] = this.themeStyles[k];
            }
        }
    }

    getChatItemStyle() {
        return this.CHAT_STYLE;
    }

    getStyle(component) {
        return this.themeStyles[component];
    }

    getThemeProperty(component) {
        if (this.theme[component]) return this.theme[component];
        return DEFAULT_THEME[component];
    }

    get primaryColor(){
        return this.themeStyles.primaryColor;
    }
}

const Theme = new ThemeService();
export default Theme;