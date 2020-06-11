import Mobi from './Mobi';

var langs = {};

/**
 * Registers a new language.
 * @param {string} lang Language
 */
export function registerLanguage(lang){
    langs[lang.key] = lang;
}

const DEFAULT_LANG = 'en';

/**
 * Translates with key.
 * @param {string} str String to translate.
 * @return {string} Translate word
 */
export default function(str){
    let lang = Mobi.getLanguage();
    if(langs[lang]) {
        if(langs[lang]['data'][str]){
            return langs[lang]['data'][str];
        }
        else if(lang != DEFAULT_LANG){
            if(langs[DEFAULT_LANG] && langs[DEFAULT_LANG]['data'][str]){
                return langs[DEFAULT_LANG] && langs[DEFAULT_LANG]['data'][str];
            }
        }
    }
    else{
        if(langs[DEFAULT_LANG] && langs[DEFAULT_LANG]['data'][str]){
            return langs[DEFAULT_LANG] && langs[DEFAULT_LANG]['data'][str];
        }
    }
    return str;
}