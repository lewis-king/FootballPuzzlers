import React from 'react';
import {Alert, Text, TouchableHighlight, StyleSheet, View} from 'react-native';
import {Fonts} from "../utils/fonts";
import {categoryToItemSku, purchaseProduct, endConnection} from '../services/in-app-purchase';
import {unlockAlert} from '../services/in-app-purchase/alert';
import ProductsDAO from '../dao/products-dao';

const UnlockText = ({category, product, productUnlocked, refresh}) => {
  const {unlockText, unlockContainer} = styles;
  if (productUnlocked) {
    return null;
  } else {
    const amount = product.localizedPrice || product.price;
    const currencyCode = product.currency;
    return (
      <TouchableHighlight onPress={() => {
        unlockAlert(product, refresh);
      }}>
      <View style={unlockContainer}>

        <Text style={unlockText}>Unlock {amount} {currencyCode}</Text>
      </View>
      </TouchableHighlight>
  );
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