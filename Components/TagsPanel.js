import React, { Component } from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default class TagsPanel extends React.PureComponent {
    _renderItem = (e, index) => {
        let {data, active} = this.props;
        let bg = e.value !== undefined && e.value == active ? e.activeColor || 'green' : e.color;
        return (
            <View key={index} style={[styles.item, {
                backgroundColor : bg,
            }, this.props.itemStyle]}>
                <Text style={[styles.text, this.props.textStyle]}>{e.title}</Text>
            </View>
        );
    }
    render() {
        let {data, active} = this.props;

        if(!data || !data.length) return null;
        return (
            <View>
                <View style={{
                    flexDirection : 'row',
                    flexWrap: 'wrap',
                    paddingLeft : 4,
                    paddingRight : 4
                }}>
                    {data.map(this._renderItem)}
                </View>
            </View>
        )
    }
}

var styles = StyleSheet.create({
    text : {
        color : '#fff'
    },
    item : {
        paddingTop : 4,
        paddingBottom : 4,
        paddingLeft : 8,
        paddingRight : 8,
        marginRight : 4,
        marginBottom : 8,
        marginLeft : 4,
        marginTop : 4
    }
});