import React, {Component} from 'react'
import { View, StyleSheet, ScrollView, Text } from 'react-native'
import Form from './Form'
import Tabs from './../Tabs';
import TouchableNativeFeedback from './TouchableNativeFeedback';

import Theme, {FormStyle} from './../Theme';
import lang from './../lang';
import Toast from './Toast';
import Icon from './Icon';

const {TextInputStyle} = FormStyle;

class IndicatorStep extends React.PureComponent{
    renderStatus(index){
        const {current} = this.props;

        if(index === current){
            return (
                <View style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: Theme.primaryColor
                }} />
            )
        }
        else if(current > index){
            return (
                <Icon name='check' size={16} color={Theme.primaryColor} />
            )
        }
    }

    render(){
        const {steps, current} = this.props;

        return (
            <View style={{
                display: 'flex',
                flexDirection: 'row',
                height: 72
            }}>
                {steps.map((step, index) => {
                    return (
                        <View key={index} style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center'
                        }}>
                            <View style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center'
                            }}>
                                <View style={{
                                    height: 2,
                                    backgroundColor: index === 0 ? 'transparent' : Theme.primaryColor,
                                    flex: 1,
                                    marginRight: 4
                                }} />
                                <View style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    borderColor: Theme.primaryColor,
                                    borderWidth: 2,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    {this.renderStatus(index)}
                                </View>
                                <View style={{
                                    height: 2,
                                    backgroundColor: steps.length - 1 === index ? 'transparent' : Theme.primaryColor,
                                    flex: 1,
                                    marginLeft: 4
                                }} />
                            </View>
                            <Text style={{
                                fontSize: 12,
                                marginTop: 4
                            }}>{step.title}</Text>
                        </View>
                    )
                })}
            </View>
        )
    }
}

export default class FormStep extends Component{
    constructor(props){
        super(props);

        this.forms = {};
        this.state = {
            current: 0
        }
    }

    _onTabSelected = (index) => {
        this.setState({
            current: index
        })
    }

    onStepSubmit = (step, index) => {
        if(!this.tab) return;

        if(!this.forms[index]) return;
        
        let form = this.forms[index];
        if(form.isPass()){
            if(this.props.form.steps.length - 1 === index){
                if(this.props.onSubmit){
                    let data = {};
                    let errors = [];
                    for(let k in this.forms){
                        let f = this.forms[k];
                        data[f.getFormName()] = f.getData();
                        if(!f.isPass()){
                            errors.push(f.getErrors());
                        }
                    }
                    this.props.onSubmit(!errors.length ? null: errors, data);
                }
            }
            else{
                this.tab.next();
            }
        }
        else{
            let errors = form.getErrors();
            if(errors) return Toast.show(errors.join('\n'));
        }
        
    }

    onPrevStep = (step, index) => {
        if(!this.tab) return;
        this.tab.prev();
    }

    renderStep(step, index){
        const {form} = this.props;

        return (
            <View title={step.title} key={index} style={styles.step}>
                <ScrollView>
                    <View style={styles.content}>
                        <Form ref={(c) => this.forms[index] = c} fields={step.fields} onSubmit={this._onSubmit} showSubmitButton={false} name={step.key} />
                    </View>
                </ScrollView>
                <View style={styles.form_button}>
                    {index ? <TouchableNativeFeedback onPress={() => this.onPrevStep(step, index)}>
                        <View style={[styles.submit_button, {
                            height : TextInputStyle.inputHeight,
                        }]}>
                            <Icon name='arrow-back' size={24} color={Theme.primaryColor} />
                            <Text style={{
                                color: Theme.primaryColor,
                                textTransform: 'uppercase',
                                marginLeft: 8
                            }}>{'Quay lại'}</Text>
                        </View>
                    </TouchableNativeFeedback>: null}
                    <View style={styles.step_btn_center}></View>
                    <TouchableNativeFeedback onPress={() => this.onStepSubmit(step, index)}>
                        <View style={[styles.submit_button, {
                            height : TextInputStyle.inputHeight,
                            backgroundColor: Theme.primaryColor
                        }]}>
                            <Text style={{
                                color: '#fff',
                                textTransform: 'uppercase',
                                marginRight: 2
                            }}>{form.steps.length - 1 === index ? 'Đăng Tin' : 'Tiếp Theo'}</Text>
                            <Icon name='navigate-next' size={24} color='#fff' />
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>
        )
    }

    render(){
        const {form} = this.props;

        return (
            <View style={styles.container}>
                <IndicatorStep steps={form.steps} current={this.state.current} />
                <Tabs 
                    ref={(c) => this.tab = c} 
                    onTabSelected={this._onTabSelected}
                    hideTabBar={true}
                >
                    {form.steps.map((step, index) => this.renderStep(step, index))}
                </Tabs>
            </View>
        )
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        padding: 16
    },
    step: {
        flex: 1
    },
    form_button: {
        display: 'flex',
        flexDirection: 'row',
        
    },
    step_btn_center: {
        flex: 1,
    },
    submit_button: {
        justifyContent : 'center',
        alignContent : 'center',
        alignItems : 'center',
        minWidth: 72,
        paddingLeft: 12,
        paddingRight: 12,
        flexDirection: 'row'
    }
})