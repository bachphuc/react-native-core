import React, {Component} from 'react';

import {View, StyleSheet, TouchableOpacity} from 'react-native';

import Image from './Image';
import Api from './../Api';

import Navigator from 'app/Navigator';

export default class PhotoLayout extends Component{
    _onError = (event) => {

    }

    _onPress(photo, index){
        let photos = this.props.photos;
        Navigator.open('photo.viewer', {photos : photos, index : index});
    }

    render(){
        if(!this.props || !this.props.photos || !this.props.photos.length){
            return null;
        }
        let photos = this.props.photos;
        if(photos.length == 2){
            return (
                <View style={styles.wrap}>  
                    <View style={styles.row}>
                        {photos.map( (p, index) => 
                            <TouchableOpacity key={p.id} onPress={() => this._onPress(p, index)} style={[styles.item, styles.col]}>
                                <Image resizeMode='cover' style={styles.ratio11} source={{uri : Api.getImage(p.thumbnail_720 || p.image)}} placeholder={true} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            );
        }
        else if(photos.length == 3){
            return (
                <View style={styles.wrap}> 
                    <View style={styles.row}>
                        <TouchableOpacity key={photos[0].id} onPress={() => this._onPress(photos[0], 0)} style={[styles.item, styles.col]}>
                            <Image resizeMode='cover' style={styles.ratio21} source={{uri : Api.getImage(photos[0].thumbnail_720 || photos[0].image)}} placeholder={true} />
                        </TouchableOpacity>
                    </View> 
                    <View style={styles.row}>
                        {photos.map( (p, index) => {
                            if(!index) return null;
                            return (
                                <TouchableOpacity key={p.id} onPress={() => this._onPress(p, index)} style={[styles.item, styles.col]}>
                                    <Image resizeMode='cover' style={styles.ratio11} source={{uri : Api.getImage(p.thumbnail_720 || p.image)}} placeholder={true} />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            );
        }
        else if(photos.length == 4){
            return (
                <View style={styles.wrap}>  
                    <View style={styles.row}>
                        {photos.map( (p, index) => {
                            if(index > 1) return null;
                            return (
                                <TouchableOpacity key={p.id} onPress={() => this._onPress(p, index)} style={[styles.item, styles.col]}>
                                    <Image resizeMode='cover' style={styles.ratio11} source={{uri : Api.getImage(p.thumbnail_720 || p.image)}} placeholder={true} />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    <View style={styles.row}>
                        {photos.map( (p, index) => {
                            if(index < 2) return null;
                            return (
                                <TouchableOpacity key={p.id} onPress={() => this._onPress(p, index)} style={[styles.item, styles.col]}>
                                    <Image resizeMode='cover' style={styles.ratio11} source={{uri : Api.getImage(p.thumbnail_720 || p.image)}} placeholder={true} />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            );
        }
        else{
            return (
                <View style={styles.wrap}>  
                    <View style={styles.row}>
                        {photos.map( (p, index) => {
                            if(index > 1) return null;
                            return (
                                <TouchableOpacity key={p.id} onPress={() => this._onPress(p, index)} style={[styles.item, styles.col]}>
                                    <Image onError={this._onError} resizeMode='cover' style={styles.ratio11} source={{uri : Api.getImage(p.thumbnail_720 || p.image)}} placeholder={true} />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    <View style={styles.row}>
                        {photos.map( (p, index) => {
                            if(index < 2 || index > 6) return null;
                            return (
                                <TouchableOpacity key={p.id} onPress={() => this._onPress(p, index)} style={[styles.item, styles.col]}>
                                    <Image resizeMode='cover' style={styles.ratio11} source={{uri : Api.getImage(p.thumbnail_720 || p.image)}} placeholder={true} />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            );
        }
    }
}

var styles = StyleSheet.create({
    wrap : {

    },
    row : {
        flexDirection : 'row',
        marginBottom : 2
    },
    col : {
        flex : 1,
        minHeight: 50,
        marginLeft : 1,
        marginRight : 1
    },
    item : {
        backgroundColor : 'rgba(0, 0, 0, 0.2)',
    },
    ratio11 : {
        aspectRatio : 1,
    },
    ratio21 : {
        aspectRatio : 2,
    }
});