import React from 'react';
import {StyleSheet, View} from 'react-native';
import { LinearTextGradient } from 'react-native-text-gradient';
import {Fonts} from '../utils/fonts';

const Header = (props) => {
    const headerTxt = props.text;
    const {headerStyle, header} = styles;
    return <View style={header}>
                <LinearTextGradient style={headerStyle} colors={['blue', 'red']}
                               locations={[0, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0}}>
                    {headerTxt}
                </LinearTextGradient>
            </View>
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
  header: {
    alignContent: 'space-between',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
});

export default Header;