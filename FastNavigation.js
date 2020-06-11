import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

export const isMountedRef = React.createRef();

export const navigationRef = React.createRef();

/**
 * Navigates between screens.
 * @param {string} name router name.
 * @param {object} params route parameters.
 */
export function navigate(name, params) {
    name = name.toLowerCase();
    if (isMountedRef.current && navigationRef.current) {
        // Perform navigation if the app has mounted
        navigationRef
            .current
            .navigate(name, params);
    } else {
        // You can decide what to do if the app hasn't mounted You can ignore this, or
        // add these actions to a queue you can call later
    }
}

/**
 * Goes back previous screen.
 */
export function goBack() {
    if (isMountedRef.current && navigationRef.current) {
        // Perform navigation if the app has mounted
        navigationRef
            .current
            .goBack();
    } else {
        // You can decide what to do if the app hasn't mounted You can ignore this, or
        // add these actions to a queue you can call later
    }
}

export const Stack = createStackNavigator();

export default function AppNavigationContainer({children}){
    useEffect(() => {
        isMountedRef.current = true;
        return () => (isMountedRef.current = false);
    }, [])
    
    return (
        <NavigationContainer ref={navigationRef}>{children}</NavigationContainer>
    )
}

/**
 * Creates a new Stack Screen.
 * @param {string} name Route name.
 * @param {object} component Screen component.
 * @param {object} params Screen parameters
 * @return {Stack.Screen} Screen
 */
export function createScreen(name, component, params){
    name = name.toLowerCase();
    let options = {};
    if(params){
        if(params.options){
            options = params.options;
        }
        else{
            if(params.headerShown !== undefined){
                options.headerShown = params.headerShown;
            }
            if(params.animationEnabled !== undefined){
                options.animationEnabled = params.animationEnabled;
            }
        }
    }
    return <Stack.Screen name={name} component={component} key={name} options={options} />
}

export const Navigator = {
    navigate,
    goBack
}
