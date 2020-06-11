import React , {Component} from 'react';
import {View, Text, Platform, StyleSheet, SafeAreaView, ActionSheetIOS} from 'react-native';
import ModalOptions from './ModalOptions';
import ConfirmBox from './/ConfirmBox';
import ModalInput from './/ModalInput';
import SnackView from './SnackView';
import Permissions from './Permissions';
import {Log} from './../Utils';
import Toast from './Toast';
import ToolBar from './ToolBar';
import {Actions} from 'react-native-router-flux';

import MobiSocket from './../Socket/MobiSocket';

import ImagePicker from 'react-native-image-picker';

import BackgroundView from './BackgroundView';
import lang from './../lang';
import Theme from './../Theme';
import ColorUtils from './../ColorUtils';
import NavigationMenu from './NavigationMenu';

export default class MobiScreen extends Component{
    state = {};
    options = {};
    modalOptions = [];
    modalOptionCallback = null;

    modalConfirmBoxCallback = null;
    modalConfirmBoxParams = null;

    modalInputCallback = null;
    modalInputParams = null;

    exit(action){
        if(action){
            let {params} = this.props;

            if(params && params.onReturn && typeof params.onReturn === 'function'){
                params.onReturn(action);
            }
        }
        Actions.pop();
    }

    showOptionMenus(options, callback, params){
        if(!options || !options.length) return;
        if(Platform.OS == 'ios'){
            return this.showOptionMenusIos(options, callback, params);
        }
        this.modalOptions = options;
        this.modalOptionCallback = callback;
        if(!params) {
            params = {};
        }
        params.showCancelOption = true;
        this.modalOptionParams = params;

        this.setState({showModalOptions : true});
    }   

    showOptionMenusIos(options, callback, params){
        let destructiveButtonIndex = -1;
        let labels = options.map( (e, i) => {
            if(typeof e === 'object' && e.type == 'danger'){
                destructiveButtonIndex = i;
            }
            return typeof e === 'string' ? e : e.title || e.name || '';
        });
        labels.push(lang('cancel'));
        let sheetParams = {
            options: labels,
            cancelButtonIndex: labels.length - 1
        };

        if(destructiveButtonIndex > -1){
            sheetParams.destructiveButtonIndex = destructiveButtonIndex;
        }

        ActionSheetIOS.showActionSheetWithOptions(sheetParams,
        (buttonIndex) => {
            if(buttonIndex != sheetParams.cancelButtonIndex){
                callback(buttonIndex, options[buttonIndex]);
            }
        });
    }

    onModalOptionSelect = (index, option) => {
        if(this.modalOptionCallback){
            this.modalOptionCallback(index, option);
        }
        this.setState({showModalOptions : false});
    }

    onRequestCloseOptionModal = () => {
        this.setState({showModalOptions : false});
    }

    onRequestCloseConfirmBox = () => {
        this.setState({showConfirmBox : false});
    }

    confirm(params, callback){
        this.modalConfirmBoxParams = params;
        this.modalConfirmBoxCallback = callback;
        this.setState({showConfirmBox : true});
    }

    onConfirmBoxResult = (result) => {
        Log('onConfirmBoxResult > ' + result);
        this.setState({showConfirmBox : false});
        if(this.modalConfirmBoxCallback){
            this.modalConfirmBoxCallback(result);
        }
    }

    showInputForm(params, callback){
        this.modalInputCallback = callback;
        this.modalInputParams = params;
        this.setState({showModalInput : true});
    }

    renderModalOptions(){
        if(!this.modalOptions || !this.modalOptions.length) return null;
        return (
            <ModalOptions onRequestClose={this.onRequestCloseOptionModal} visible={this.state.showModalOptions} params={this.modalOptionParams} options={this.modalOptions} onSelected={this.onModalOptionSelect} />
        );
    }

    renderConfirmBox(){
        if(!this.modalConfirmBoxParams) return null;
        return (
            <ConfirmBox params={this.modalConfirmBoxParams} onRequestClose={this.onRequestCloseConfirmBox} visible={this.state.showConfirmBox} onResult={this.onConfirmBoxResult} />
        );
    }

    onRequestCloseModalInput = () => {
        this.setState({showModalInput : false});
    }

    onModalInputResult = (result, data) => {
        this.setState({showModalInput : false});
        if(!result){
            if(this.modalInputCallback){
                return this.modalInputCallback(false);
            }
        }
        return this.modalInputCallback(true, data);
    }

    renderModalInput(){
        if(!this.modalInputParams || !this.modalInputParams.fields) return null;
        
        return (
            <ModalInput params={this.modalInputParams} onRequestClose={this.onRequestCloseModalInput} visible={this.state.showModalInput} onResult={this.onModalInputResult} />
        );
    }

    showSnackView(text, textAction = null){
        this.setState({
            showSnackView : true,
            snackViewText : text,
            snackViewTextAction : textAction
        });
    }

    hideSnackView(){
        this.setState({
            showSnackView : false
        });
    }

    onSnackViewPress = () => {

    }

    _onSnackViewPress = () => {
        this.hideSnackView();
        this.onSnackViewPress();
    }

    renderContent(){
        return null;
    }

    checkPermission(permission, params){
        let options = {
            'title' : 'MobiSocial want to use ' + permission,
            'message' : 'MobiSocial App needs access to ' + permission + ' to do some awesome features.',
            'failure_message' : 'You denied this permission. So some feature maybe not working well.'
        };
        if(params){
            options = Object.assign(options, params);
        }
        
        // request permission camera if android
        if(Platform.OS === 'android'){
            setTimeout(() => {
                Permissions.check(permission)
                .then(check => {
                    if(check){
                        // Toast.show('MobiSocial can use Camera');
                    }
                    else{
                        // Toast.show('Request camera permission');
                        this.requestPermission(permission, options);
                    }
                })
                .catch(() => {
                    // Toast.show('Catch something was wrong with camera permission.');
                });
            }, 3000);
        }
    }

    async requestPermission(permission, options) {
        try {
            const granted = await Permissions.request(permission, {
                'title': options.title,
                'message': options.message
            })
            if (granted === Permissions.RESULTS.GRANTED) {
                // Toast.show("You can use the camera");
            } else {
                Toast.show(options.failure_message);
            }
        } catch (err) {
            Log(err);
        }
    }

    requestCameraPermission(){
        if(Platform.OS === 'android'){
            this.checkPermission(Permissions.PERMISSIONS.CAMERA, {
                'title' : 'MobiSocial Camera Permission',
                'message': 'MobiSocial App needs access to your camera so you can take awesome pictures.',
                'failure_message' : "Camera permission denied. Some features maybe not working well. Please allow MobiSocial use Camera."
            });
        }
    }

    removePhoto = () => {
        this.setState({index : null, photoUrl : null});
    }

    openCamera = () => {
        if(this.canGetDeviceImage){
            let check = this.canGetDeviceImage();
            if(!check) return;
        }
        let options = {};
        // Launch Camera:
        ImagePicker.launchCamera(options, this.getPhotoSuccess);
    }

    openGallery = () => {
        if(this.canGetDeviceImage){
            let check = this.canGetDeviceImage();
            if(!check) return;
        }
        let options = {};
        // Open Image Library:
        ImagePicker.launchImageLibrary(options, this.getPhotoSuccess);
    }

    getPhotoSuccess = (response) => {
        if (response.didCancel) {
            Log('User cancelled image picker');
            Toast.show('User cancelled image picker');
        } else if (response.error) {
            Log('ImagePicker Error: ', response.error);
            MobiSocket.pLog('MobiScreen > getPhotoSuccess');
            MobiSocket.pLog(response);
            Toast.show('Cannot get image from gallery now. Please try again later or contact admin to get support.');
        } else if (response.customButton) {
            Log('User tapped custom button: ', response.customButton);
            Toast.show('User tapped custom button');
        } else {
            // You can also display the image using data: let source = { uri:
            // 'data:image/jpeg;base64,' + response.data };
            // Log(response);
            // Log(response.uri);
            // response.uri = 'file:///storage/emulated/0/Download/%40Venkatesh_Sompari_Walls%40-27.jpg';
            // response.uri = 'file:///storage/emulated/0/Download/@Venkatesh_Sompari_Walls@-27.jpg';
            if(this.onGetPhotoSucceed){
                this.onGetPhotoSucceed(response);
            }
            this.setState({photoUrl : response.uri});
        }
    }

    getTitle(){
        return (this.options && this.options.title) || this.title || '';
    }

    /**
     * override in your screen when use enableSearch
     */
    onSearchChanged = (text) => {

    }

    /**
     * override in your screen when use enableSearch
     */
    onSearchSubmit = (text) => {

    }

    onSearchBoxVisibleChanged = (visible) => {
        this.setState({searchVisible : visible});
    }

    renderToolBarRightView(){
        return null;
    }

    renderSearchResultContent(){
        return null;
    }

    _renderSearchResult(){
        if(!this.options || !this.options.enableSearch) return null;
        if(!this.state || !this.state.searchVisible) return false;
        let bShowSearchPanel = this.options.showSearchPanel !== undefined ? this.options.showSearchPanel : true;
        if(!bShowSearchPanel) return false;
        return (
            <View style={styles.searchPanel}>
                {this.renderSearchResultContent()}
            </View>
        );
    }

    showLoading(title){
        if(title){
            this.options.processingText = title;
        }
        this.setState({
            isTaskProcessing : true
        });
    }

    hideLoading(success = false){
        let newState = {
            isTaskProcessing : false,
            isTaskCompleted : success
        };
        this.setState(newState);
    }

    showNavigationDrawer(){
        this.drawerLayout && this.drawerLayout.show();
    }

    hideNavigationDrawer(){
        this.drawerLayout && this.drawerLayout.hide();
    }

    toggleNavigationDrawer(){
        this.drawerLayout && this.drawerLayout.toggle();
    }

    _navigationMenuRef = (c) => {
        this.drawerLayout = c;
    }

    renderNavigationContent(){
        return null;
    }

    render(){
        let isProcessing = this.state && this.state.isTaskProcessing !== undefined ? this.state.isTaskProcessing : false;
        let completed = this.state && this.state.isTaskCompleted !== undefined ? this.state.isTaskCompleted : false;

        let {primaryColor} = Theme;

        let statusBarColor = ColorUtils.darker(0.2, primaryColor);

        return (
            <SafeAreaView style={{
                flex : 1,
                backgroundColor : statusBarColor
            }}> 
                <View style={{
                    flex : 1,
                    backgroundColor : '#ffffff'
                }}>
                    <BackgroundView 
                        loading={isProcessing} 
                        style={{
                            flex : 1
                        }} 
                        loadingText={this.options.processingText || lang('processing')} 
                        completed={completed}
                        completedText={this.options.completedText}
                    >
                        {this.options.showToolBar ?
                        <ToolBar 
                            numberOfLines={this.options.numberOfLines || 1} 
                            title={this.getTitle()} 
                            subTitle={this.options && this.options.subTitle ? this.options.subTitle : undefined} 
                            showBackIcon={this.options.showBackButton} 
                            backIconType={this.options.backIconType} 
                            fontSize={this.options.fontSize} 
                            centerTitle={this.options.centerTitle} 
                            backIcon={this.options.backIcon} 
                            customFont={this.options.customFont !== undefined ? this.options.customFont : true} 
                            rightView={this.renderToolBarRightView()} 
                            enableSearch={this.options.enableSearch}
                            onChangeText={this.onSearchChanged}
                            onSearchSubmit={this.onSearchSubmit}
                            searchPlaceholder={this.options.searchPlaceholder}
                            onSearchBoxVisibleChanged={this.onSearchBoxVisibleChanged}
                            onPress={this.onBackPress}
                        /> 
                        : null}
                        <View style={{
                            flex : 1
                        }}>
                            {this.renderContent()}
                            {this._renderSearchResult()}
                        </View>
                    </BackgroundView>
                    
                    {this.options.useNavigationMenu ? <NavigationMenu ref={this._navigationMenuRef}>{this.renderNavigationContent()}</NavigationMenu> : null}
                    <SnackView visible={this.state.showSnackView} onPress={this._onSnackViewPress} actionText={this.state.snackViewTextAction} text={this.state.snackViewText} />
                    {this.renderModalOptions()}
                    {this.renderConfirmBox()}
                    {this.renderModalInput()}
                </View>
            </SafeAreaView>
        );
    }
}

var styles = StyleSheet.create({
    searchPanel : {
        position : 'absolute',
        top : 0,
        left : 0,
        right : 0,
        bottom : 0,
        backgroundColor : '#ffffff'
    }
});