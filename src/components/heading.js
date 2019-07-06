import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import { LinearTextGradient } from 'react-native-text-gradient';
import {Fonts} from '../utils/fonts';

const Heading = ({text, size, alignment}) => {
    const headerTxt = text;
    const fontSize = size || 30;
    const flexAlignment = alignment || "flex-start";
    const margin = alignment === "center" ? 0 : 10;
    const {headerStyle, header} = styles;
    return <View style={[header, {justifyContent: flexAlignment, alignItems: flexAlignment}]}>
                <LinearTextGradient style={[headerStyle, {fontSize, marginLeft: margin}]} colors={['rgba(108, 74, 248, 1)', 'rgba(255, 0, 88, 1)']}
                               locations={[0, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0}}>
                    {headerTxt}
                </LinearTextGradient>
            </View>
};

const styles = StyleSheet.create({
  headerStyle: {
    textAlign: 'left',
    fontFamily: Fonts.Main,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  header: {
    alignContent: 'space-between',
    flexDirection: 'row',
  },
});

export default Heading;