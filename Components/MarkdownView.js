import {MarkdownView as MarkdownViewNative} from 'react-native-markdown-view'

import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default class MarkdownView extends Component {
    render() {
        return (
            <View style={this.props.style}>
                <MarkdownViewNative styles={styles}>{this.props.content}</MarkdownViewNative>
            </View>
        )
    }
}

var styles = {
    blockQuote: {
        marginLeft: 10,
        opacity: 0.8
    },
    codeBlock: {
        backgroundColor: 'rgba(128, 128, 128, 0.1)',
        fontWeight : 'normal',
        padding : 8,
        borderRadius : 4,
        fontSize : 12
    },
    del: {
        textDecorationLine: 'line-through'
    },
    em: {
        fontStyle: 'italic'
    },
    heading: {
        fontWeight: '700'
    },
    heading1: {
        fontSize: 32,
        marginTop: 12,
        marginBottom: 12,
        marginLeft: 0,
        marginRight: 0
    },
    heading2: {
        fontSize: 24,
        marginTop: 8,
        marginBottom: 8,
        marginLeft: 0,
        marginRight: 0
    },
    heading3: {
        fontSize: 20,
        marginTop: 4,
        marginBottom: 4,
        marginLeft: 0,
        marginRight: 0
    },
    heading4: {
        fontSize: 16,
        marginTop: 4,
        marginBottom: 4,
        marginLeft: 0,
        marginRight: 0
    },
    heading5: {
        fontSize: 14,
        marginTop: 4,
        marginBottom: 4,
        marginLeft: 0,
        marginRight: 0
    },
    heading6: {
        fontSize: 11,
        marginTop: 4,
        marginBottom: 4,
        marginLeft: 0,
        marginRight: 0
    },
    hr: {
        backgroundColor: '#ccc',
        height: 1
    },
    imageWrapper: {
        padding: 4,
        width: 320,
        height: 320
    },
    image: {
        flexGrow: 1,
        resizeMode : 'contain'
    },
    inlineCode: {
        backgroundColor: 'rgba(128, 128, 128, 0.15)',
        fontFamily: 'Courier',
        fontWeight: '500'
    },
    link: {
        color: '#0366d6'
    },
    list: {
        margin: 8
    },
    listItem: {
        flexDirection: 'row'
    },
    listItemNumber: {
        minWidth: 32,
        paddingRight: 4
    },
    listItemBullet: {
        minWidth: 32,
        paddingRight: 4
    },
    listItemOrderedContent: {
        flex: 1
    },
    listItemUnorderedContent: {
        flex: 1
    },
    paragraph: {
        marginTop: 10,
        marginBottom: 10
    },
    strong: {
        fontWeight: '700'
    }
};