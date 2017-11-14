import React from 'React';
import {StyleSheet, Text} from 'react-native';

const Header = () => {
    const {headerStyle} = styles;
    return <Text style={headerStyle}>Football Puzzlers</Text>
}

const styles = StyleSheet.create({
    headerStyle: {
        textAlign: 'center',
        alignItems: 'center',
        margin: 5,
        fontSize: 30,
        fontWeight: 'bold',
        color: '#ffffff'
    },
});

export default Header;