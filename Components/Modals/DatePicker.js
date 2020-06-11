import React, {Component} from 'react';
import {
    Text,
    View,
    DatePickerAndroid,
    DatePickerIOS,
    Modal,
    StyleSheet,
    Platform,
    TouchableOpacity
} from 'react-native';

export const DatePickerAction = {
    dismissedAction: 'dismissedAction',
    dateSetAction: 'dateSetAction'
}

export default class DatePicker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            date: props.date || new Date(),
            visible: true
        };
    }
    componentDidMount = () => {
        if (Platform.OS == 'android') {
            DatePickerAndroid
                .open({date: this.state.date})
                .then(this._onResult)
                .catch(err => {
                    console.log(err);
                });
        }
    }

    _onResult = (result) => {
        if(result.action == DatePickerAction.dateSetAction){
            let d = new Date(result.year, result.month, result.day, 0, 0, 0, 0);
            result.date = d;
        }
        this.props.onDateSelected && this
            .props
            .onDateSelected(result);
    }

    _done = () => {
        let {date} = this.state;
        let result = {
            action: DatePickerAction.dateSetAction,
            year: date.getFullYear(),
            month: date.getMonth(),
            day: date.getDate(),
            date : date
        };
        this.props.onDateSelected && this
            .props
            .onDateSelected(result);
        this.setState({visible: false});
    }

    _cancel = () => {
        this.props.onDateSelected && this
            .props
            .onDateSelected({action: DatePickerAction.dismissedAction});
        this.setState({visible: false});
    }

    _onRequestClose = () => {
        this._cancel();
    }

    _onDateChange = (date) => {
        this.setState({date});
    }

    render() {
        if (!this.state.visible) 
            return null;
        if (Platform.OS == 'android') {
            return <View/>
        }
        return (
            <Modal onRequestClose={this._onRequestClose} transparent={true}>
                <View style={styles.container}>
                    <View style={{
                        flex: 1
                    }}/>
                    <View
                        style={{
                        padding: 16,
                        flexDirection: 'row',
                        borderTopColor: '#efefef',
                        borderTopWidth: 1
                    }}>
                        <TouchableOpacity onPress={this._cancel}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                        <View style={{
                            flex: 1
                        }}/>
                        <TouchableOpacity onPress={this._done}>
                            <Text>DONE</Text>
                        </TouchableOpacity>
                    </View>
                    <DatePickerIOS date={this.state.date} onDateChange={this._onDateChange}/>
                </View>
            </Modal>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1
    }
});