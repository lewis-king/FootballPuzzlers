import React from 'react';
import {Text, StyleSheet, View} from 'react-native';
import {Fonts} from "../utils/fonts";
import {categoryToItemSku} from '../services/in-app-purchase';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const UnlockImg = ({category, product, productUnlocked}) => {
  const {categoryMetaSubHeading} = styles;
  if (productUnlocked) {
    return null;
  } else {
    return <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}>
      <Icon name="lock-outline" size={60} color="#FFFFFF" />
      <Text style={[categoryMetaSubHeading, {fontSize: 20}]}>Tap to Unlock</Text>
    </View>
  }
};

export default UnlockImg;

const styles = StyleSheet.create({
  categoryMetaSubHeading: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: Fonts.Main
  }
});