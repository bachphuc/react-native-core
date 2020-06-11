import React, {Component} from 'react';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Foundation from 'react-native-vector-icons/Foundation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import Zocial from 'react-native-vector-icons/Zocial';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Fontisto from 'react-native-vector-icons/AntDesign';

const ICON_MAPS = {
    Entypo,
    EvilIcons,
    FontAwesome,
    Foundation,
    Ionicons,
    MaterialCommunityIcons,
    Octicons,
    Zocial,
    SimpleLineIcons,
    Feather,
    AntDesign,
    MaterialIcon,
    Fontisto
}

export default class Icon extends Component {
    
    setNativeProps(data){
        if(this._ref){
            if(this._ref.setNativeProps){
                this._ref.setNativeProps(data);
            }
        }
    }

    _onRef = (c) => {
        this._ref = c;
    }

    render() {
        const {captureRefEvent, ...rest} = this.props;
        let type = this.props.type || 'MaterialIcon';

        const IconClass = ICON_MAPS[type] || MaterialIcon;
        const onRef = captureRefEvent ? this._onRef : undefined;

        return <IconClass {...rest} ref={onRef}/>;
    }
}