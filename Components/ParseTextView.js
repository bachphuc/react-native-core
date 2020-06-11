import React, { Component } from 'react';
import {View, Text} from 'react-native';

class CustomText extends Component{

    _onPress = () => {
        this.props.onPress && this.props.onPress(this.props.name, this.props.value);
    }

    render(){
        let {value} = this.props;

        let text = !value ? '' : (typeof value === 'string' ? value : (value.title || value.name || '') );
        return (
            <Text {...this.props} onPress={this._onPress}>{text}</Text>
        );
    }
}

export default class ParseTextView extends React.PureComponent {
    constructor(props){
        super(props);
        this.autoKey = 1;
    }

    _onItemClick = (name, item) => {
        this.props.onItemPress && this.props.onItemPress(name, item);
    }

    applyText(content, key, value){
        if(!content) return content;
        if(typeof content !== 'string') return content;

        let tmps = content.split(`[${key}]`);
        if(tmps.length == 1) return content;

        let {itemStyle} = this.props;
        let style = itemStyle && itemStyle[key] ? itemStyle[key] : undefined;
        let l = tmps.length;
        for(let j = 0; j < l -1 ; j++){
            tmps.splice(j * 2 + 1, 0, <CustomText name={key} onPress={this._onItemClick} key={this.autoKey} value={value} style={style} />);
            this.autoKey++;
        }   

        return tmps
    }

    applyMultiText(ar, key, value){
        let results = [];
        ar.forEach(text => {
			let tmpre;
			if(Array.isArray(text)){
				tmpre = this.applyMultiText(text, key, value);
			}
			else{
				tmpre = this.applyText(text, key, value);
			}
            results.push(tmpre);
        }); 
        
        return results;
    }

    parseText(content, data){
        let input = [content];

        for(let k in data){
            let v = data[k];

            input = this.applyMultiText(input, k, v);
        }
		
		let results = [];
		
		this.joinArr(results, input);
		
		return results;
    }
	
	joinArr(results, arrs){
		arrs.forEach(e => {
			if(e){
				if(Array.isArray(e)) {
					this.joinArr(results, e);
				}
				else{
					results.push(e);
				}
			}
		});
	}

    render() {

        let {content, data} = this.props;
        let views = this.parseText(content, data);
        return (
            <View>
                <Text>{views}</Text>
            </View>
        )
    }
}
