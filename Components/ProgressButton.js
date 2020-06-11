import React, { Component} from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator, LayoutAnimation, Platform , ViewPropTypes} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import * as Animatable from 'react-native-animatable';

import PropTypes from 'prop-types';

const navbarOffset = Platform.OS === 'ios' ? 20 : 0;
const navbarBaseHeight = Platform.OS === 'ios' ? 44 : 30;

var appStyle = {
    navbar: {
        offset: navbarOffset,
        baseHeight: navbarBaseHeight,
        height: navbarBaseHeight + navbarOffset,
    },
    font: {
        fontSize: {
            small: 11,
            default: 13,
            big: 15,
            large: 17,
            huge: 20,
        },
    },
    colors: {
        primary: '#05A5D1',
        lightText: '#FAFAFA',
        background: '#F5FCFF',
    },
    margins: {
        inner: 10,
        outer: 25,
    },
    dimensions: {
        touchableHeight: 48,
        visibleButtonHeight: 36,
        largeButtonHeight: 50,
        largeButtonWidth: 250,
    },
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: appStyle.dimensions.touchableHeight * 1.3,
        minWidth: 2 * appStyle.dimensions.largeButtonHeight,
    },
    button: {
        alignSelf: 'stretch',
        justifyContent: 'center',
        height: appStyle.dimensions.largeButtonHeight,
        borderRadius: 30,
        overflow: 'hidden', // step 1
    },
    buttonIdle: {
        height: appStyle.dimensions.touchableHeight,
        paddingHorizontal: appStyle.margins.inner,
        minWidth: appStyle.dimensions.largeButtonWidth,
    },
    buttonFetching: {
        alignSelf: 'center',
        width: appStyle.dimensions.largeButtonHeight,
    },
    buttonError: {
        alignSelf: 'center',
        backgroundColor: '#f44336',
        width: appStyle.dimensions.largeButtonHeight,
    },
    buttonSuccess: {
        alignSelf: 'center',
        backgroundColor: '#4caf50',
        width: appStyle.dimensions.largeButtonHeight,
    },
    text: {
        textAlign: 'center',
        fontSize: appStyle.font.fontSize.big,
    },
    textWhite: {
        textAlign: 'center',
        backgroundColor: 'transparent',
    }
});

class ProgressButton extends Component {

    status = {
        IDLE: 'idle',
        ERROR: 'error',
        SUCCESS: 'success',
        FETCHING: 'fetching',
    };

    constructor() {
        super();
        this.state = {
            status: this.status.IDLE,
        };
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount = () => {
        this._isMounted = false;
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        let nextStatus = this.status.IDLE;
        if (nextProps.isFetching) {
            nextStatus = this.status.FETCHING;
        }
        if (nextProps.isError) {
            nextStatus = this.status.ERROR;
        }
        if (nextProps.isSuccess) {
            nextStatus = this.status.SUCCESS;
        }

        if (nextStatus === this.state.status) {
            return;
        }
        this.setState({ status: nextStatus });

        this.restoreAfterTimer(nextStatus);
        this.launchAnimation(nextStatus); // step 2
    }

    restoreAfterTimer(fromStatus) {
        if(!this._isMounted) return;
        setTimeout(() => {
            if(!this._isMounted) return;
            if (fromStatus === this.status.FETCHING || this.state.status !== fromStatus) {
                return;
            }
            this.setState({ status: this.status.IDLE });
        }, 3000);
    }

    launchAnimation(status) {
        if(!this._isMounted) return;
        if (status === this.status.ERROR) {
            this.refs.button.rotate(300);
            setTimeout(() => this.refs.button.shake(400), 400);
        }
        if (status === this.status.SUCCESS) {
            this.refs.button.rotate(300);
        }
    }


    UNSAFE_componentWillUpdate() {
        // step 1
        LayoutAnimation.easeInEaseOut(); 
    }

    getContent() {
        switch (this.state.status) {
            case this.status.FETCHING:
                return (
                    <ActivityIndicator />
                );

            case this.status.ERROR:
                return (
                    <Text style={[styles.text, styles.textWhite, {color : this.state.textColor || appStyle.colors.lightText}]}>!</Text>
                );

            case this.status.SUCCESS:
                return <Icon style={styles.textWhite} name="done" size={appStyle.font.fontSize.huge} />;

            default:
                return (
                    <Text style={[styles.text, {color: this.props.textColor || '#1a237e'}]}>{this.props.children.toUpperCase()}</Text>
                );
        }
    }

    getButtonStyle() {
        switch (this.state.status) {
            case this.status.FETCHING:
                return styles.buttonFetching
            case this.status.ERROR:
                return styles.buttonError;
            case this.status.SUCCESS:
                return styles.buttonSuccess
            default:
                return styles.buttonIdle;
        }
    }

    render() {
        const props = this.props;
        const buttonStyle = this.getButtonStyle();

        // step 2 : Animatable.View
        return (
            <TouchableOpacity onPress={props.onPress} style={styles.container}>
                <Animatable.View style={[styles.button, {backgroundColor: this.props.backgroundColor || appStyle.colors.lightText} , buttonStyle, props.style]} ref="button">
                { this.getContent()}
                </Animatable.View>
            </TouchableOpacity>
        );
    }
}

ProgressButton.propTypes = {
    children: PropTypes.string,
    onPress: PropTypes.func,
    buttonType: PropTypes.string,
    isFetching: PropTypes.bool,
    isError: PropTypes.bool,
    isSuccess: PropTypes.bool,
    style: ViewPropTypes.style,
};

export default ProgressButton;
