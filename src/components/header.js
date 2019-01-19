import React from 'react';
import {StyleSheet, Text} from 'react-native';
import { LinearTextGradient } from 'react-native-text-gradient';
import {Fonts} from '../utils/fonts';

const Header = (props) => {
    const headerTxt = props.text;
    const {headerStyle} = styles;
    return <LinearTextGradient style={headerStyle} colors={['blue', 'red']}
                               locations={[0, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0}}>
            {headerTxt}
      </LinearTextGradient>
};

const styles = StyleSheet.create({
    headerStyle: {
        textAlign: 'center',
        alignItems: 'center',
        margin: 3,
        fontFamily: Fonts.Main,
        fontSize: 30,
        fontWeight: 'bold',
    },
});

export default Header;