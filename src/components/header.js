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
        margin: 10,
        fontSize: 30,
        fontWeight: 'bold'
    },
});

export default Header;