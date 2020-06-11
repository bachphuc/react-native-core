import React, {Component} from 'react';

import {Modal, Text, View, StyleSheet, Dimensions, ScrollView} from 'react-native';

import TouchableNativeFeedback from './TouchableNativeFeedback';
import lang from './../lang';

class OptionItem extends React.PureComponent{
    _onPress = () => {
        let {index, option} = this.props;
        this.props.onPress && this.props.onPress(index, option);
    }

    render(){
        let {index, option} = this.props;
        return (
            <TouchableNativeFeedback key={index} onPress={this._onPress}>
                <View style={{
                    height : 40,
                    justifyContent : 'center',
                    borderTopColor : '#efefef',
                    borderTopWidth : index ? 1 : 0,
                    paddingLeft : 16,
                    paddingRight : 8
                }}><Text style={{fontSize : 14}}>{typeof option === 'string' ? option : option.title || option.name}</Text>
                </View>
            </TouchableNativeFeedback>
        );
    }
}

export default class ModalOptions extends Component{
    constructor(props){
        super(props);
    }

    handlePress = (k, option) => {
        if(this.props.onSelected){
            this.props.onSelected(k, option);
        }
    }

    onRequestClose = () => {
        this.props.onRequestClose && this.props.onRequestClose();
    }

    hasTitle(){
        let {params, title} = this.props;
        if(title) return true;
        if(params && params.title) return true;

        return false;
    }

    getTitle(){
        let {params, title} = this.props;
        
        return title || (params &&  params.title) || '';
    }

    _renderItem = (option , k) => {
        if(typeof option === 'object' && option.hidden) return null;
        return <OptionItem key={k} index={k} option={option} onPress={this.handlePress} />
    }

    render(){
        const {options} = this.props;
        if(!options || !options.length) return null;

        const WINDOW_HEIGHT = Dimensions.get('window').height;

        const height = 40 * options.length;
        let bUseScrollView = false;

        let innerStyle = {
            paddingTop: hasTitle ? 0 : 16,
       };

        if(height > 0.8 * WINDOW_HEIGHT){
            bUseScrollView = true;
            innerStyle.height = Math.round(0.8 * WINDOW_HEIGHT);
        }

        let hasTitle = this.hasTitle();
        return (
            <Modal visible={this.props.visible ? true : false} onRequestClose={this.onRequestClose} transparent={true} animationType='fade'>
                <View style={styles.container}>
                    <View style={[styles.inner, innerStyle]}>
                        {hasTitle ? <View style={styles.title}>
                            <Text style={{
                                fontSize : 16,
                                fontWeight : 'bold'
                            }}>{this.getTitle()}</Text>
                        </View>: null}

                        {bUseScrollView ? 
                        <ScrollView style={styles.scrollView}>
                            {options.map(this._renderItem)}
                        </ScrollView>
                        : options.map(this._renderItem) }

                        {this.props.params && this.props.params.showCancelOption ?
                        <OptionItem key={'cancel'}  option={lang('cancel')} onPress={this.props.onRequestClose} />   
                        : null}
                    </View>
                </View>
            </Modal>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex : 1,
        backgroundColor : 'rgba(0,0,0,0.5)',
        alignContent : 'center',
        justifyContent : 'center',
        alignItems : 'center'
    },
    inner: {
        backgroundColor : '#fff',
        borderRadius : 2,
        width: '80%',
        paddingBottom : 16
    },
    title: {
        height : 48,
        justifyContent : 'center',
        paddingLeft : 16,
        borderBottomColor : '#efefef',
        borderBottomWidth : 1
    },
    scrollView: {
        flex: 1
    }
})