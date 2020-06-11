import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Theme from './../Theme';

class Item extends React.PureComponent{

    _onPress = () => {
        this.props.onPress && this.props.onPress(this.props.item);
    }

    render(){
        const {item, columns, active} = this.props;
        return (
            <TouchableOpacity 
                style={[styles.option, {
                    flexBasis: `${100 / columns}%`
                }]}
                onPress={this._onPress}
            >
                <View style={[styles.option_inner, active ? {
                    borderColor: Theme.primaryColor
                } : {}]}>
                    <Text>{item.title}</Text>
                </View>
            </TouchableOpacity>
        )
    }
}

export default class ListSelected extends Component{
    key = 'value'

    constructor(props){
        super(props);

        let options = this.props.options;
        let selected = [];
        if(options && options.length && this.props.value){
            var parts = this.props.value.split(',');
            options.forEach(e => {
                if(parts.indexOf(e.value) !== -1){
                    selected.push(e);
                }
            })
        }

        this.state = {
            selected: selected,
        }
    }

    _onItemPress = (item) => {
        let {selected} = this.state;
        const index = this.state.selected.indexOf(item);
        if(index === -1){
            selected.push(item);
        }
        else{
            selected.splice(index, 1);
        }
        this.setState({
            selected,
        })

        this.props.onChanged && this.props.onChanged(selected);
    }

    isActive(item){
        return this.state.selected.indexOf(item) !== -1 ? true : false;
    }

    renderOption = (e, index) => {
        const {columns} = this.props;
        return (
            <Item item={e} index={index} key={index} columns={columns || 1} active={this.isActive(e)} onPress={this._onItemPress} />
        )
    }


    render(){
        const {options} = this.props;
        return (
            <View style={styles.container}>
                {options.map((e, index) => this.renderOption(e, index))}
            </View>
        )
    }
}

var styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    option: {
        flexGrow: 0,
        flexShrink: 0,
        padding: 4
    },
    option_inner: {
        height: 32,
        borderWidth: 1,
        borderRadius: 4,
        borderColor: '#ccc',
        display: 'flex',
        flexDirection: 'row',
        alignContent: 'center',
        alignItems: 'center',
        paddingLeft: 8,
    }
})