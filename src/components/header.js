import React from 'React';
import {StyleSheet, Text} from 'react-native';
import {Fonts} from '../../src/utils/font';

const Header = (props) => {
    const headerTxt = props.text;
    const {headerStyle} = styles;
    return <Text style={headerStyle}>{headerTxt}</Text>
};

const styles = StyleSheet.create({
    headerStyle: {
        textAlign: 'center',
        alignItems: 'center',
        margin: 5,
        fontFamily: Fonts.Cabin,
        fontSize: 30,
        fontWeight: 'bold',
        color: '#ffffff'
    },
});

export default Header;