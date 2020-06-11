import React, { Component } from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

import ColorUtils from './../../ColorUtils';

const colors = new ColorUtils.Rainbow({length : WEEK_DAYS.length});

export default class WeekSelect extends Component {
    constructor(props){
        super(props);

        this.state = {
            selected : this.props.initValues || []
        };
    }

    _onPress(e){
        let {selected} = this.state;
        let index = selected.indexOf(e);
        if(index === -1){
            selected.push(e);
        }
        else{
            selected.splice(index, 1);
        }
        this.setState({selected});
        this.props.onDaysChanged && this.props.onDaysChanged(selected);
    }

    render() {
        return (
            <View style={{
                flexDirection : 'row',
                flexWrap: 'wrap',
                padding : 4,
            }}>
                {WEEK_DAYS.map((e, i) => 
                    <TouchableOpacity key={i} onPress={() => this._onPress(e)}>
                        <View style={{
                            paddingTop : 4,
                            paddingBottom : 4,
                            paddingLeft : 8,
                            paddingRight : 8,
                            backgroundColor : this.state.selected.indexOf(e) !== -1 ? colors[i] : '#999999',
                            margin : 4
                        }}>
                            <Text style={{
                                color : '#fff',
                                fontSize : 12
                            }}>{e}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        )
    }
}
