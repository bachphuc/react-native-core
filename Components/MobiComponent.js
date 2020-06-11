import React , {Component} from 'react';

export default class MobiComponent extends Component{
    screenContext = null;
    constructor(props){
        super(props);
        if(props.screenContext){
            this.screenContext = props.screenContext;
        }
    }
}