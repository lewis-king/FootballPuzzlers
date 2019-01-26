import React from 'react';
import {Text, StyleSheet, View} from 'react-native';
import {Fonts} from "../utils/fonts";
import {categoryToItemSku} from '../services/in-app-purchase';

const UnlockText = ({category, product}) => {
  const {unlockText, unlockContainer} = styles;
  if (category === "ENG1" || (product != null && product == categoryToItemSku[category])) {
    return null;
  } else {
    return <View style={unlockContainer}>
      <Text style={unlockText}>Unlock £1.39</Text>
    </View>;
  }
};

export default UnlockText;

const styles = StyleSheet.create({
  unlockContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
  },
  unlockText: {
    color: 'black',
    margin: 5,
    fontFamily: Fonts.Main,
    fontWeight: 'bold',
    fontSize: 10,
    textAlign: 'center'
  }
});