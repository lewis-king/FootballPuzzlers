import React from 'react';
import {Text, StyleSheet, View} from 'react-native';
import {Constants} from "../utils/constants";
import {Fonts} from "../utils/fonts";

const UnlockText = () => {
  const {unlockText} = styles;
  return <View style={{backgroundColor: 'white'}}>
    <Text style={unlockText}>Unlock £1.99</Text>
  </View>
};

export default UnlockText;

const styles = StyleSheet.create({
  unlockText: {
    color: 'black',
    margin: 10,
    fontFamily: Fonts.Main,
    fontSize: 14,
    textAlign: 'center'
  }
});