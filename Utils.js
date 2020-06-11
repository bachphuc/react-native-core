import {
    StyleSheet
} from 'react-native';

export default function renderIf(condition, content) {
    if (condition) {
        return content;
    } else {
        return null;
    }
}

export const Styles = StyleSheet.create({
    hide: {
        display: 'none'
    },
    nothing: {

    }
});

const LOG_TAGS = 'BottomSheet';

export function Log(data) {
    if(!data) return;
    if (__DEV__) {
        if(typeof data === 'string'){
            if(data.indexOf(LOG_TAGS) !== -1){
                console.log(data);
                return;
            }
            return;
        }
        console.log(data);
    }
}

export function Warn(data) {
    if (__DEV__) {
        console.warn(data);
    }
}

const DAY_SECOND = 28800;
const WEEK_SECOND = DAY_SECOND * 7;

export const TIME_MAPS = {
    's' : 1,
    'second' : 1,
    'seconds' : 1,
    'giây' : '1',
    'phút' : 60,
    'minute' : 60,
    'minutes' : 60,
    'min' : 60,
    'mins' : 60,
    'hours' : 3600,
    'hour' : 3600,
    'giờ' : 3600,
    'h' : 3600,
    'day' : DAY_SECOND,
    'days' : DAY_SECOND,
    'ngày' : DAY_SECOND,
    'd' : DAY_SECOND,
    'dd' : DAY_SECOND,
    'tuần' : WEEK_SECOND,
    'week' : WEEK_SECOND,
    'weeks' : WEEK_SECOND,
    'w' : WEEK_SECOND,
    'tháng' : 2592000,
    'month' : 2592000,
    'months' : 2592000,
    'm' : 2592000,
    'mm' : 2592000,
    'năm' : 31536000,
    'year' : 31536000,
    'years' : 31536000,
    'y' : 31536000,
    'yy' : 31536000,
    'yyyy' : 31536000
}

class HelperUtils {
    ucfirst(str) {
        if (!str) return '';
        str += ''
        var f = str.charAt(0)
            .toUpperCase()
        return f + str.substr(1)
    }

    convertFunctionName(str) {
        if (!str) return;
        var ar = str.split('_');
        return ar.map((e, k) => {
            if (!k) {
                return e.toLowerCase();

            } else {
                return Utils.ucfirst(e);
            }
        }).join('');
    }

    parseTime(sTime){
        if (!sTime) return '';
        if (typeof sTime === 'string' && sTime.indexOf('T') == -1) {
            sTime = sTime.replace(' ', 'T') + 'Z';
        }
        var d = new Date(sTime);
        return d;
    }

    formatDate(sTime){
        if (!sTime) return '';
        if (typeof sTime === 'string' && sTime.indexOf('T') == -1) {
            sTime = sTime.replace(' ', 'T') + 'Z';
        }
        var d = new Date(sTime);
        return d.toDateString();
    }

    formatTime(sTime, type = 'long') {
        if (!sTime) return '';
        if (typeof sTime === 'string' && sTime.indexOf('T') == -1) {
            sTime = sTime.replace(' ', 'T') + 'Z';
        }
        var d = new Date(sTime);
        var sHour = d.getHours().toString();
        var sMinutes = d.getMinutes().toString();

        var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        var shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        var n = new Date();

        var distance = Math.round((n - d) / 1000);
        if (distance < 10) {
            return 'Just now';
        }

        if (distance >= 10 && distance < 60) {
            if(type == 'long'){
                return distance + ' seconds ago';
            }
            return distance + ' sec ago';
        }

        var distanceMinutes = Math.round(distance / 60);
        if (distanceMinutes < 60) {
            if(type == 'long'){
                return distanceMinutes + ' minutes ago';
            }
            return distanceMinutes + ' min ago';
        }

        var distanceHours = Math.round(distanceMinutes / 60);
        if (distanceHours < 24) {
            if(type == 'long'){
                return distanceHours + ' hours ago';
            }
            return distanceHours + ' h ago';
        }

        var sDate = '';
        if (d.getDate() != n.getDate()) {
            if(type == 'long'){
                sDate = monthNames[d.getMonth()] + ' ' + d.getDate() + ' ';
            }
            else{
                sDate = shortMonthNames[d.getMonth()] + ' ' + d.getDate() + ' ';
            }
        }

        return sDate + (sHour.length < 2 ? '0' + sHour : sHour) + ':' + (sMinutes.length < 2 ? '0' + sMinutes : sMinutes);
    }

    createUniqueString(length) {
        if (typeof length === 'undefined') {
            length = 32;
        }
        var text = "";
        var possible = "ABCDEF-GHIJKLMNOPQR-STUVWXYZabcdef-ghijklmnopqrs-tuvwxyz012-3456789";

        for (var i = 0; i < length; i++) {
            var c = possible.charAt(Math.floor(Math.random() * possible.length));
            if (c == '-') {
                if (i === 0 || i == length - 1) {
                    c = possible.charAt(Math.floor(Math.random() * possible.length));
                } else if (i > 1 && text.charAt(i - 1) == '-') {
                    c = possible.charAt(Math.floor(Math.random() * possible.length));
                }
            }
            text += c;
        }
        return text;
    }
    
    validateEmail(email) {
        if (!email) {
            return false;
        }
        email = email.trim();
        if (!email) return false;
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    extractLinkFromText(text) {
        if (!text) return null;
        var reg = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/i;
        var match = reg.exec(text);
        if (!match) return null;
        if (!match[0]) return null;
        return match[0];
    }

    formatDuration(duration){
        if(!duration) return '00:00';
        let minutes = Math.floor(duration / 60);
        let sMinutes = minutes < 10 ? '0' + minutes : minutes;
        let seconds = Math.floor(duration - minutes * 60);
        let sSeconds = seconds < 10 ? '0' + seconds : seconds;
        return `${sMinutes}:${sSeconds}`;
    }

    isInt(v){
        return Number.isInteger(parseFloat(v));
    }

    convertTimeStringToSecond(str){
		if(!str) return false;
		str = str.trim().toLowerCase();
		if(!str) return false;
			
		let tmps = str.split(' ');
		if(tmps.length < 2) return false;
		if(tmps.length % 2 == 1) return false;
		
		let total = 0;
		for(let i = 0; i < tmps.length / 2; i++){
			if(isNaN(tmps[2 * i])) return false;
			if(!TIME_MAPS[tmps[2 * i + 1]]) return false;
			let nums = parseFloat(tmps[2 * i]);
			total+= nums * TIME_MAPS[tmps[2 * i + 1]];
		}
		return total;
    }
    
    convertSecondToTimeString(seconds, levels){
		if(!seconds) return '';
		if(!levels){
            levels = ['year', 'month', 'week', 'day', 'hour', 'minute'];
        }
        let str = '';
        levels.forEach(e => {
            let t = TIME_MAPS[e];
            if(seconds >= t){
                let nums = Math.floor(seconds / t);
				str+= nums + ' ' + e + (nums > 1 ? 's' : '') + ' ';
				seconds = seconds - nums * t;
            }
        });
        return str;
    }

    convertSecondToTimeArray(seconds, type){
        if(!seconds) return false;
        let levels = null;
        if(type == 'short'){
            levels = ['y', 'm', 'w', 'd', 'h', 'min'];
        }
		else{
            levels = ['year', 'month', 'week', 'day', 'hour', 'minute'];
        }
        let ars = [];
        levels.forEach(e => {
            let t = TIME_MAPS[e];
            if(seconds >= t){
                let nums = Math.floor(seconds / t);
                ars.push({
                    title : e,
                    value : nums
                });
				seconds = seconds - nums * t;
            }
        });
        
        return ars;
    }

    convertSecondToTimeShortString(seconds){
        let levels = ['y', 'm', 'w', 'd', 'h', 'min'];
        return Utils.convertSecondToTimeString(seconds, levels);
    }
    
    dayOfWeek(){
        const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return WEEK_DAYS[(new Date()).getDay()];
    }

    extends(target, obj){
        if(!target || ! obj) return false;
        let cloneObj = Object.assign({}, obj);
       
        for(let k in cloneObj){
            if(!target[k]){
                let v = cloneObj[k];

                if(typeof v === 'object'){
                    target[k] = JSON.parse(JSON.stringify(cloneObj[k]));
                }
                else if(typeof v === 'function'){
                    target[k] = cloneObj[k];
                }
                else{
                    target[k] = cloneObj[k];
                }
            }
        }
        return true;
    }

    round(number, precision) {
        var shift = function (number, precision, reverseShift) {
            if (reverseShift) {
            precision = -precision;
            }  
            var numArray = ("" + number).split("e");
            return +(numArray[0] + "e" + (numArray[1] ? (+numArray[1] + precision) : precision));
        };
        return shift(Math.round(shift(number, precision, false)), precision, true);
    }

    isUrl(url) {
        var pattern = /^((http|https|ftp):\/\/)/;
        return pattern.test(url);
    }

    isYoutubeUrl = function(url) {
        if (!this.isUrl(url)) {
            return false;
        }
        let pattern = /(youtube|youtu\.be)/;
        return pattern.test(url);
    }
}

class StorageService{
    constructor(){
        this.data = {};
    }

    set(key, value){
        this.data[key] = value;
    }

    get(key){
        return this.data[key];
    }

    pop(key){
        let value = this.data[key];
        this.data[key] = undefined;
        return value;
    }

    has(key){
        return this.data[key] ? true : false;
    }
}

export const Storage = new StorageService();

export var Utils = new HelperUtils();

export function price_display(str){
    if(!str) return 'Chưa có giá';
    let price = parseInt(str);
    if(!price) return 'Chưa có giá';

    let maps = {
        'tỉ' : 1000000000,
        'triệu': 1000000,
        'ngàn' : 1000,
    }

    let units = [];

    for(let key in maps){
        let value = maps[key];
        let mod = price % value;
        let nums = Math.floor(price / value);
        if(nums > 0){
            units.push({
                'unit' : key, 
                'nums' : nums
            });
            price-= nums * value;
        }
    }

    let tmp = [];
    units.forEach(unit => {
        tmp.push(unit['nums'] + " " + unit['unit']);
    })

    return tmp.join(' ');
}