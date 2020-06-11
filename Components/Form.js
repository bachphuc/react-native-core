import React, { Component } from 'react';
import {View, Text, TouchableOpacity, Button, StyleSheet} from 'react-native';
import TouchableNativeFeedback from './TouchableNativeFeedback';
import TagsPanel from './TagsPanel';

import {Utils, Log} from './../Utils';
import ColorPicker from './Modals/ColorPicker';
import lang from './../lang';
import Toast from './Toast';
import DatePicker, {DatePickerAction} from './Modals/DatePicker';
import ModalOptions from './ModalOptions';
import Icon from './Icon';
import WeekSelect from './FormElements/WeekSelect';
import TextInput from './FormElements/TextInput';

import Image from './Image';

import ImagePicker from 'react-native-image-picker';

import Theme, {FormStyle} from './../Theme';
import ListSelected from './ListSelected';

const {TextInputStyle} = FormStyle;

// TODO: create some example data
var TASK_TYPE_OPTIONS = [{
    title : 'Fix Time',
    value : 'fix_time'
}, {
    title : 'Timeline',
    value : 'time_line'
}];

var tmpFields = [{
    // type text
    key : 'name',
    title : 'Full Name',
    placeholder : 'Enter your name...',
    type : 'text',
    required : true
}, {
    // type email
    key : 'email',
    title : 'Email',
    placeholder : 'Enter your email...',
    type : 'email',
    required : true
},  {
    // type link
    key : 'link',
    title : 'Link',
    placeholder : 'Enter your link...',
    type : 'link',
    required : true
}, {
    // type image, select from gallery
    key : 'image',
    title : 'Image',
    type : 'image'
}, {
    key : 'task_type',
    title : 'Task Type',
    type : 'select',
    options : TASK_TYPE_OPTIONS,
    // default value
    value : TASK_TYPE_OPTIONS[0].value,
    selected : TASK_TYPE_OPTIONS[0],
    placeholder : 'Task Type'
}];

export default class Form extends Component {
    constructor(props){
        super(props);

        this.state = {
            showColorPicker : false,
            isShowDatePicker : false,
            date : new Date()
        };

        if(this.props && this.props.fields){
            this.state.fields = this.props.fields;
        }

        this.inputs = {};
    }

    getValueOf(field){
        return field.value || '';
    }

    getFormName(){
        return this.props.name || '';
    }

    onFieldChanged(field, value){
        let {fields} = this.state;
        field.value = value;
        this.setState({fields});
    }

    _submit = () => {
        let pass = this.isPass();
        if(pass){
            return this.props.onSubmit && this.props.onSubmit(false, this.getData());
        }
        else{
            return this.props.onSubmit && this.props.onSubmit(this.getErrors());
        }
    }

    isPass(){
        let {fields} = this.state;
        this.errors = [];
        let data = this.getData();
        fields.forEach(e => {
            let isActive = e.canShow === undefined ? true : e.canShow(e, data, fields);
            if(!isActive) return;

            e.isError = false;

            if(e.validate && typeof e.validate === 'function'){
                let error = e.validate(e, data, fields);
                if(error){
                    e.isError = true;
                    this.errors.push(error);
                    return false;
                }
            }

            // check condition required
            if(e.required){
                if(!e.value) {
                    e.isError = true;
                    this.errors.push(`${e.title || Utils.ucfirst(e.key)} is required.`);
                    return false;
                }
            }
            // validate type
            if(e.type === 'email'){
                if(!Utils.validateEmail(e.value)){
                    e.isError = true;
                    this.errors.push(`${e.title || Utils.ucfirst(e.key)} is invalid email.`);
                }
            }
            else if(e.type === 'number'){
                if(isNaN(e.value)){
                    e.isError = true;
                    this.errors.push(`${e.title || Utils.ucfirst(e.key)} must be a number.`);
                }
            }
            else if(e.type === 'int'){
                if (!Utils.isInt(e.value)){
                    e.isError = true;
                    this.errors.push(`${e.title || Utils.ucfirst(e.key)} is not integer.`);
                }                    
            }
            else if(e.type === 'link'){
                let link = Utils.extractLinkFromText(e.value);
                if(!link){
                    e.isError = true;
                    this.errors.push(`${e.title || Utils.ucfirst(e.key)} is invalid link.`);
                }
            }
            else if(e.type === 'timeAmountString'){
                let s = Utils.convertTimeStringToSecond(e.text);
                if(s === false){
                    e.isError = true;
                    this.errors.push(`${e.title || Utils.ucfirst(e.key)} is invalid time.`);
                }
            }
            else if(e.type === 'images'){
                if(e.required && (!e.value || !e.value.length)){
                    e.isError = true;
                    this.errors.push(`${e.title || Utils.ucfirst(e.key)} is required.`);
                }
            }
        });

        this.setState({
            errors: this.errors
        })
        if(this.errors.length) return false;
        return true;
    }

    getErrors(){
        // check all fields
        this.isPass();
        return this.errors && this.errors.length ? this.errors : null;
    }

    setData(data){
        if(!data) return;
        let {fields} = this.state;
        let hasChange = false;
        // TODO: need to process data here


        fields.forEach(e => {
            if(data[e.key]){
                hasChange = true;
                let v = data[e.key];
                if(e.type == 'date'){
                    e.value = Utils.parseTime(v);
                }
                else if(e.type == 'select'){
                    e.selected = e.options.find(ee => ee.value == v);
                    e.value = v;
                }
                else if(e.type == 'week'){
                    e.value = v;
                    e.selected = e.value.split(',');
                }
                else if(e.type == 'timeAmountString'){
                    e.value = v;
                    e.text = Utils.convertSecondToTimeString(v);
                }
                else{
                    e.value = v;
                }
            }
        });
        if(hasChange){
            this.setState({fields});
        }
    }

    getData(){
        // get form data
        let {fields} = this.state;
        let data = {};
        fields.forEach(e => {
            if(e.value !== undefined){
                data[e.key] = e.value;
            }
        });
        return data;
    }

    reset(){
        let {fields} = this.state;
        fields.forEach(e => {
            if(e.default){
                if(e.type === 'select'){
                    e.value = e.default.value;
                    e.selected = e.default;
                }
            }
            else{
                e.value = undefined;
                e.selected = undefined;
                e.date = undefined;
                e.text = undefined;
            }
        });
        this.setState({fields});
    }

    _colorSelected = (color) => {
        Log('Form > ' + color);
        if(this.tmpColorField){
            if(this.tmpColorField.type == 'color'){
                this.tmpColorField.value = color;
            }
            else if(this.tmpColorField.type == 'colorTags'){
                this.tmpColorField.color = color;
            }
            this.tmpColorField = null;
        }
        this._onRequestCloseColorPicker();
    }

    _onRequestCloseColorPicker = () => {
        this.setState({showColorPicker : false});
    }

    chooseColor(e){
        this.tmpColorField = e;
        this.setState({showColorPicker : true});
    }

    renderColorInput(e, index){
        return (
            <TouchableOpacity onPress={() => this.chooseColor(e)}>
                <View style={{
                    marginTop : 8,
                    borderWidth : e.value ? 0 : 1,
                    borderColor : '#cccccc',
                    height : 32,
                    marginBottom : 8,
                    backgroundColor : e.value || '#ffffff'
                }} />
            </TouchableOpacity>
        );
    }

    onColorTagsInputChanged(field, value){
        let {fields} = this.state;
        field.text = value;
        this.setState({fields});
    }

    getColorTagsValueOf(field){
        return field.text || '';
    }

    _onColorTagsSubmitEditing = (field) => {
        Log('Form > _onColorTagsSubmitEditing > ' + field.text);
        if(!field.text) return;
        if(!field.value){
            field.value = [];
        }
        let {fields} = this.state;
        field.value.push({
            title : field.text,
            color : field.color || '#4CAF50'
        });
        field.text = '';
        this.setState({fields});
    }

    renderColorTagsInput(e, index){
        return (
            <View style={{
                marginTop : 8
            }}>
                <View style={{
                    flexDirection : 'row',
                }}>
                    <TouchableOpacity onPress={() => this.chooseColor(e)}>
                        <View style={{
                            width : TextInputStyle.inputHeight,
                            height : TextInputStyle.inputHeight,
                            backgroundColor : e.color || '#4CAF50'
                        }}/>
                    </TouchableOpacity>
                    <View style={{
                        flex : 1
                    }}>
                        <TextInput 
                            returnKeyLabel='done'
                            onChangeText={(text) => this.onColorTagsInputChanged(e, text)}
                            value={this.getColorTagsValueOf(e)}
                            blurOnSubmit={true}
                            placeholder={e.placeholder}
                            onSubmitEditing={() => this._onColorTagsSubmitEditing(e)}
                        />
                    </View>
                </View>
                <View style={{
                    marginTop : 8
                }}>
                    <TagsPanel data={e.value} length={e.value ? e.value.length : 0} />
                </View>
            </View>
        );
    }

    /**
     * BEGIN: handle type: date
     */
    showDatePicker = (field) => {
        this.tmpDateField = field;
        this.setState({isShowDatePicker : true, date : field.value || new Date()});
    }

    _onDatePickerChange = (result) => {
        Log('Form > _onDatePickerChange > ' + JSON.stringify(result) );
        if(result.action == DatePickerAction.dismissedAction || !this.tmpDateField) {
            return this.setState({isShowDatePicker : false});
        }
        let {fields} = this.state;
        this.tmpDateField.value = result.date;
        this.setState({isShowDatePicker : false});
    }

    renderDateInput(e, index){
        return (
            <TouchableOpacity onPress={() => this.showDatePicker(e)}>
                <View style={{
                    borderColor : TextInputStyle.borderColor,
                    paddingLeft : 8,
                    borderWidth : 1,
                    height : TextInputStyle.inputHeight,
                    justifyContent : 'center'
                }}>
                    <Text>{e.value ? new Date(e.value).toDateString() : lang('select_date')}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    /**
     * END: handle type date
     */

    /**
     * BEGIN: handle type select
     */
    showModalOptions = (field) => {
        this.tmpOptions = field;
        let modalTitle = field.title || field.key || field.placeholder;
        this.setState({
            isShowModalOptions : true,
            modalOptionData : field.options,
            modalOptionTitle : modalTitle ? Utils.ucfirst(modalTitle) : ''
        })
    }

    renderSelectInput(e, index){
        return (
            <TouchableOpacity onPress={() => this.showModalOptions(e)}>
                <View style={[styles.select, {
                    borderColor : TextInputStyle.borderColor,
                }]}>
                    <Text style={styles.select_text}>{e.selected ? e.selected.title : ''}</Text>
                    <Icon name='keyboard-arrow-down' size={24} />
                </View>
            </TouchableOpacity>
        );
    }

    _onSelectedModalOption = (index, item) => {
        this.tmpOptions.value = typeof item === 'object' ? item.value || item.id : item;
        this.tmpOptions.selected = item;
        if(this.tmpOptions.onChanged){
            this.tmpOptions.onChanged(this.tmpOptions, this.getData(), this.state.fields);
        }
        this.setState({isShowModalOptions : false});
    }
    /**
     * END handle type: select
     */

    /**
     * BEGIN: handle type:checkbox
     */
    _checkBoxSelected(field, item){
        let {fields} = this.state;
        field.value = item.value;
        field.selected = item;
        this.setState({fields});
    }

    renderCheckboxInput(e, index){
        return (
            <View style={{
                flexDirection : 'row',
                flexWrap: 'wrap',
                marginTop : 8,
                marginBottom : 16,
                padding : 4
            }}>
                {e.options.map((item,index) => 
                    <TouchableOpacity key={index} onPress={() => this._checkBoxSelected(e, item)}>
                        <View style={{
                            flexDirection : 'row',
                            margin: 4,
                            alignItems : 'center'
                        }}>
                            <Text style={{
                                marginRight : 8
                            }}>{item.title}</Text>
                            <Icon size={24} color='#666666' name={e.value == item.value ? 'check-box' : 'check-box-outline-blank'} />
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        );
    }
    /**
     * END: handle type: checkbox
     */

    /**
     * BEGIN: handle type: week
     */
    renderWeekInput(e, index){
        return (
            <WeekSelect initValues={e.selected} onDaysChanged={(selected) => this._onDaysChanged(e, selected)} />
        );
    }

    _onDaysChanged(field, selected){
        field.selected = selected;
        field.value = selected.join(',');
    }
    /**
     * END: handle type: week
     */

    renderInput(e, index){
        const type = e.type || 'input';
        let method = 'render' + Utils.ucfirst(type) + 'Input';
 
        if(this[method] !== undefined){
            return this[method](e, index);
        }

        let keyboardType = 'default'
        if(e.input_type === 'numeric'){
            keyboardType = 'numeric';
        }
        else if(e.input_type === 'email'){
            keyboardType = 'email-address'
        }
        else if(e.input_type === 'phone'){
            keyboardType = 'phone-pad'
        }

        let returnKeyType = e.return_key_type;
        let blurOnSubmit = undefined;
        let onSubmitEditing = undefined;
        let onRef = undefined;
        if(e.next_field){
            blurOnSubmit = false;
            returnKeyType = 'next';
            onSubmitEditing = () => {
                this.focusField(e.next_field);
            };
        }
        if(e.auto_focus){
            onRef = (c) => {
                this.inputs[e.key] = c;
            }
        }
        return (
            <TextInput 
                ref={onRef}
                placeholder={e.placeholder}
                onChangeText={(text) => this.onFieldChanged(e, text)}
                value={this.getValueOf(e).toString()}
                keyboardType={keyboardType}
                returnKeyType={returnKeyType}
                blurOnSubmit={blurOnSubmit}
                onSubmitEditing={onSubmitEditing}
            />
        );
    }

    focusField(inputField){
        if(this.inputs[inputField]){
            this.inputs[inputField].focus();
        }
    }

    renderListSelectedInput(field, index){
        return (
            <ListSelected options={field.options} value={field.value} columns={field.columns} onChanged={(items) => this.onListSelectedChanged(field, items)} />
        )
    }

    onListSelectedChanged = (field, items) => {
        field.selected = items;
        field.value = items.map(e => e.value).join(',');
    }

    _selectDefaultImage = (field, index) => {
        let {fields} = this.state;
        
        if(field.default_image !== undefined && field.value[field.default_image]){
            field.value[field.default_image].is_default = false;
        }

        field.default_image = index;
        field.value[index].is_default = true;

        this.setState({fields});
    }

    _onRemoveImage = (field, index) => {     
        if(!field.value || !field.value.length || !field.value[index]) return;

        let image = field.value[index];

        field.value.splice(index, 1);

        if(image.is_default && field.value.length){
            field.value[0].is_default = true;
            field.default_image = 0;
        }

        let {fields} = this.state;
        this.setState({fields});
    }

    renderImagesInput(e, index){
        const images = e.value || [];
        return (
            <View style={styles.images}>
                {images.map( (image, index) => 
                    
                        <View style={[styles.image, image.is_default ? styles.image_active : {}]} key={index}>
                            <TouchableOpacity onPress={() => this._selectDefaultImage(e, index)}>
                                <View style={styles.image_inner}>
                                    <Image 
                                        source={{uri :image.uri }} 
                                        style={styles.image_img} 
                                        resizeMode={'cover'}
                                    /> 
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.image_btn_remove} onPress={() => this._onRemoveImage(e, index)}>
                                <View style={styles.image_remove_icon}>
                                    <Icon type='Ionicons' name='md-close' size={24} color='#fff' />
                                </View>
                            </TouchableOpacity>
                        </View>
                )}

                <TouchableOpacity onPress={() => this._openGallery(e, index)}>
                    <View style={[styles.image, {borderColor : TextInputStyle.borderColor}]}>
                        {e.value && e.value.uri ? 
                        <Image 
                            source={{uri : e.value.uri }} 
                            style={styles.image_img} 
                            resizeMode={'cover'}
                        /> : null}
                        <Icon name='add' size={32} color={!e.value || !e.value.uri ?  TextInputStyle.borderColor : '#fff'} />
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    /**
     * BEGIN handle type image
     */
    renderImageInput(e, index){
        return (
            <TouchableOpacity onPress={() => this._openGallery(e, index)}>
                <View style={{
                    width : 64, 
                    height : 64,
                    borderWidth : 1,
                    borderColor : TextInputStyle.borderColor,
                    justifyContent : 'center',
                    alignContent : 'center',
                    alignItems : 'center'
                }}>
                    {e.value && e.value.uri ? 
                    <Image 
                        source={{uri : e.value.uri }} 
                        style={{
                            width : 64, 
                            height : 64,
                            position : 'absolute',
                            left : 0,
                            top : 0
                        }} 
                        resizeMode={'cover'}
                    /> : null}
                    <Icon name='image' size={32} color={!e.value || !e.value.uri ?  TextInputStyle.borderColor : '#fff'} />
                </View>
            </TouchableOpacity>
        );
    }

    _openGallery = (e, index) => {
        let options = {};
        // Open Image Library:
        ImagePicker.launchImageLibrary(options, (response) => this._getImageSuccess(e, index, response) );
    }

    _getImageSuccess(field, index, response){
        if (response.didCancel) {
            Log('User cancelled image picker');
            Toast.show('User cancelled image picker');
        } else if (response.error) {
            Log(response.error);
            Toast.show('Cannot get image from gallery now. Please try again later or contact admin to get support.');
        } else if (response.customButton) {
            Log('User tapped custom button: ');
            Log(response.customButton);
        } else {
            // You can also display the image using data: let source = { uri:
            // 'data:image/jpeg;base64,' + response.data };
            
            let image = {
                uri: response.uri,
                name: 'image.jpg',
                type: 'image/jpeg'
            };

            Log(image);

            let {fields} = this.state;

            if(field.type === 'images'){
                if(!field.value){
                    field.value = [];
                }
                if(field.default_image === undefined){
                    image.is_default = true;
                    field.default_image = 0;
                }
                field.value.push(image)
            }
            else{
                field.value = image;
            }

            this.setState({fields});
        }
    }

    /**
     * END handle type image
     */

    /**
     * BEGIN: handle type timeAmountString
     */
    onTimeAmountFieldChanged(field, value){
        let {fields} = this.state;
        field.text = value;
        let seconds = Utils.convertTimeStringToSecond(value);
        if(seconds !== false) {
            field.value = seconds;
        }
        else{
            field.value = 0;
        }
        
        this.setState({fields});
    }

    renderTimeAmountStringInput(e, index){
        return (
            <TextInput placeholder={e.placeholder}
                onChangeText={(text) => this.onTimeAmountFieldChanged(e, text)}
                value={e.text || ''}
            />
        );
    }
    /**
     * END: handle type : timeAmountString
     */

    render() {
        let {fields} = this.state;

        if(!fields || !fields.length) return null;
        let data = this.getData();
        return (
            <View style={this.props.style}>
                <View style={{
                    marginTop : 8
                }}>
                    {fields.map( (e, index) => {
                        if(e.canShow !== undefined && typeof e.canShow === 'function'){
                            let canShow = e.canShow(e, data, fields);
                            if(!canShow) {
                                return null;
                            }
                        }

                        return (
                            <View key={index} style={styles.field}>
                                <Text style={{
                                    color : '#111111',
                                    marginBottom : 8
                                }}>{e.title || e.key}</Text>
                                <View style={e.isError ? styles.field_error: {}}>
                                    {this.renderInput(e, index)}
                                </View>
                            </View>
                        );
                    })}
                    {this.props.showSubmitButton ? 
                    <TouchableNativeFeedback onPress={this._submit}>
                        <View style={[styles.submit_button, {
                            height : TextInputStyle.inputHeight,
                        }]}>
                            <Text>{lang('submit').toUpperCase()}</Text>
                        </View>
                    </TouchableNativeFeedback>
                    : null}

                </View>
                
                {this.state.isShowDatePicker ? <DatePicker date={this.state.date} onDateSelected={this._onDatePickerChange} /> : null}
                <ColorPicker onColorSelected={this._colorSelected} visible={this.state.showColorPicker} onRequestClose={this._onRequestCloseColorPicker} />

                {this.state.isShowModalOptions && this.state.modalOptionData && this.state.modalOptionData.length
                    ? <ModalOptions title={this.state.modalOptionTitle} visible={true} options={this.state.modalOptionData} onSelected={this._onSelectedModalOption} /> : null
                }
            </View>
        )
    }
}

var styles = StyleSheet.create({
    field : {
        marginBottom : 16,
        borderRadius: 4
    },
    field_error: {
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderRadius: 4
    },
    submit_button: {
        justifyContent : 'center',
        alignContent : 'center',
        alignItems : 'center',
        backgroundColor : 'rgba(0, 0, 0, 0.1)',
        borderRadius: 4
    },
    images: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },  
    image: {
        width : 64, 
        height : 64,
        borderWidth : 1,
        justifyContent : 'center',
        alignContent : 'center',
        alignItems : 'center',
        marginRight: 8, 
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'transparent',
        borderRadius: 4
    },
    image_inner: {
        width : 64, 
        height : 64,
    },
    image_img: {
        width : 62, 
        height : 62,
        position : 'absolute',
        left : 1,
        top : 1,
        borderRadius: 4
    },
    image_active: {
        borderColor: 'red'
    },
    image_remove_icon: {
        width: 24,
        height: 24,
        backgroundColor: 'red',
        display: 'flex',
        flexDirection: 'row',
        alignContent: 'center', 
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4
    },
    image_btn_remove: {
        position: 'absolute',
        right: -8,
        top: -8
    },
    select: {
        borderRadius: 4, 
        borderWidth : 1,
        height : TextInputStyle.inputHeight,
        justifyContent : 'center',
        alignItems: 'center',
        paddingLeft : 8,
        flexDirection: 'row',
        paddingRight: 8
    },
    select_text: {
        flex: 1,
    }
});