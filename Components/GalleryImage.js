import React, {Component} from 'react';
import {View, Image, Dimensions, Modal, ScrollView, TouchableHighlight, Platform, SafeAreaView} from 'react-native';

import TouchableNativeFeedback from './TouchableNativeFeedback';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import ToolBar from './ToolBar';
import Theme from './../Theme';
import {Log} from './../Utils';

import WebImage from 'react-native-awesome-image';
import ImagePicker from 'react-native-image-picker';

const ImageView = Platform.OS === 'ios' ? Image : WebImage;
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from './Toast';
import CameraRoll from './CameraRoll';

const { width } = Dimensions.get('window');

class ImageItem extends React.PureComponent{
    _onPress = () => {
        this.props.onPress && this.props.onPress(this.props.i);
    }

    render(){
        let {p, i, active} = this.props;
        return (
            <TouchableHighlight style={{
                opacity: active ? 0.5 : 1
            }} underlayColor='transparent' onPress={this._onPress}>
                <View style={{
                    padding : 1
                }}>
                    <ImageView
                        style={{
                            width: (width - 8) / 3,
                            height: (width - 8) / 3
                        }}
                        resizeMode='cover'
                        source={{uri: p.node.image.uri}}
                    />
                </View>
            </TouchableHighlight>
        );
    }
}

export default class GalleryImage extends Component{
    constructor(props){
        super(props);
        this.state = {
            modalVisible : false,
            index : null
        };
    }

    componentDidMount(){
        this._amount = true;
        this.getPhotos();
    }

    componentWillUnmount(){
        this._amount = false;
    }

    getPhotos(){
        CameraRoll.getPhotos({
            first: 50,
            assetType: 'Photos'
        })
        .then(r => {
            if(!this._amount) return;
            this.setState({ photos: r.edges });
        })
        .catch(error => Toast.show(error));
    }

    show(key){
        this.actionKey = key;
        this.setState({modalVisible : true});
    }

    hide(){
        this.setState({modalVisible : false});
    }

    toggle(){
        Log('GalleyImage > toggle > ' + this.state.modalVisible);
        if(this.state.modalVisible){
            this.hide();
        }
        else{
            this.show();
        }
    }

    _onRequestClose = () => {
        this.hide();
    }

    onBack = () => {
        this.hide();
    }

    removePhoto = () => {
        this.setState({index : null, photoUrl : null, currentPhoto : null});
    }

    openCamera = () => {
        let options = {};
        // Launch Camera:
        ImagePicker.launchCamera(options, this.getPhotoSuccess);
    }

    openGallery = () => {
        let options = {};
        // Open Image Library:
        ImagePicker.launchImageLibrary(options, this.getPhotoSuccess);
    }

    getPhotoSuccess = (response) => {
        if (response.didCancel) {
            console.log('User cancelled image picker');
        } else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
            Toast.show('Cannot get image from gallery now. Please try again later or contact admin to get support.');
        } else if (response.customButton) {
            console.log('User tapped custom button: ', response.customButton);
        } else {
            // You can also display the image using data: let source = { uri:
            // 'data:image/jpeg;base64,' + response.data };
            let photo = response;
            this.setState({photoUrl : response.uri, index : null, currentPhoto : photo});
            this.hide();
            if(this.props.selectedPhoto){
                this.props.selectedPhoto(photo, this.actionKey);
            }
        }
    }

    setIndex = (index) => {
        if (index === this.state.index) {
            return this.setState({index : null, photoUrl : null, currentPhoto : null});
        }
        let photo = {
            uri : this.state.photos[index].node.image.uri,
            width : this.state.photos[index].node.image.width,
            height : this.state.photos[index].node.image.height,
        };
        this.setState({ index : index, photoUrl : this.state.photos[index].node.image.uri, currentPhoto : photo });
    }

    selectDone = () => {
        if(!this.state.currentPhoto) return;
        if(this.props.selectedPhoto){
            this.props.selectedPhoto(this.state.currentPhoto, this.actionKey);
        }
        this.state.index = null;
        this.state.currentPhoto = null;
        this.state.photoUrl = null;
        this.hide();
    }

    _renderItem = (p, i) => {
        return <ImageItem key={i} p={p} i={i} onPress={this.setIndex} active={i === this.state.index} />;
    }

    renderImage(){
        if(!this.state || !this.state.photos || !this.state.photos.length || !this.state.modalVisible) return null;

        return this.state.photos.map(this._renderItem);
    }

    render(){
        if(!this.state || !this.state.modalVisible) {
            return null;
        }

        let {ToolBarStyle} = Theme;

        return (
            <Modal onRequestClose={this._onRequestClose} visible={this.state.modalVisible}>
                <SafeAreaView style={{
                    flex : 1
                }}>
                    <View style={{
                        flex : 1
                    }}>
                        <ToolBar showBackIcon={true} onPress={this.onBack} refreshPreviewScreen={true} title={'Galley'} rightView={
                            <TouchableNativeFeedback onPress={this.selectDone}>
                                <View style={ToolBarStyle.toolBarButton} ><MaterialIcon name={"done"} size={24} color={Theme.primaryIconColor} /></View>
                            </TouchableNativeFeedback>
                        }/>
                        <ScrollView>
                            <View style={{
                                flexDirection : 'row',
                                flexWrap: 'wrap',
                                padding : 1
                            }}>
                                <TouchableHighlight key={'camera'} style={{
                                }} underlayColor='transparent' onPress={this.openCamera}>
                                    <View style={{
                                        padding : 1
                                    }}>
                                        <View
                                            style={{
                                                width: (width - 8) / 3,
                                                height: (width - 8) / 3,
                                                alignContent : 'center',
                                                justifyContent : 'center',
                                                alignItems : 'center',
                                                backgroundColor : '#fefefe'
                                            }}
                                        >
                                            <Ionicons name='ios-camera-outline' size={64} color="#333333" />
                                        </View>
                                    </View>
                                </TouchableHighlight>
                                <TouchableHighlight key={'gallery'} style={{
                                    
                                }} underlayColor='transparent' onPress={this.openGallery}>
                                    <View style={{
                                        padding : 1
                                    }}>
                                        <View
                                            style={{
                                                width: (width - 8) / 3,
                                                height: (width - 8) / 3,
                                                alignContent : 'center',
                                                justifyContent : 'center',
                                                alignItems : 'center',
                                                backgroundColor : '#fefefe'
                                            }}
                                        >
                                            <Ionicons name='ios-images-outline' size={64} color="#333333" />
                                        </View>
                                    </View>
                                </TouchableHighlight>

                                {this.renderImage()}
                            </View>
                        </ScrollView>
                    </View>
                </SafeAreaView>
            </Modal>
        );
    }
}