import React from 'react';
import {StyleSheet, View} from 'react-native';
import { LinearTextGradient } from 'react-native-text-gradient';
import {Fonts} from '../utils/fonts';

const Header = (props) => {
    const headerTxt = props.text;
    const {headerStyle, header} = styles;
    return <View style={header}>
                <LinearTextGradient style={headerStyle} colors={['rgba(108, 74, 248, 1)', 'rgba(255, 0, 88, 1)']}
                               locations={[0, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0}}>
                    {headerTxt}
                </LinearTextGradient>
            </View>
};

const styles = StyleSheet.create({
  headerStyle: {
    textAlign: 'left',
    alignItems: 'flex-start',
    fontFamily: Fonts.Main,
    fontSize: 30,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  header: {
    alignContent: 'space-between',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
});

export default Header;