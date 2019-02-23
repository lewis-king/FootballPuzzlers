import React from 'react';
import {Alert, Text, TouchableHighlight, StyleSheet, View} from 'react-native';
import {Fonts} from "../utils/fonts";
import {categoryToItemSku, purchaseProduct} from '../services/in-app-purchase';

const UnlockText = ({category, product}) => {
  const {unlockText, unlockContainer} = styles;
  if (category === "ENG1" || (product != null && product == categoryToItemSku[category])) {
    return null;
  } else {
    return (
      <TouchableHighlight onPress={() => {
        Alert.alert(
          'Unlock ' + {product}.product.title,
          'There are two ways of unlocking questions in whoami? You must complete all questions in the section above, or pay a fee (requires data)',
          [
            {text: 'No thanks', onPress: () => {}, style: 'cancel'},
            {text: 'Let\'s do it!', onPress: () => purchaseProduct(product)},
          ],
          { cancelable: false }
        )
      }}>
      <View style={unlockContainer}>

        <Text style={unlockText}>Unlock £1.39</Text>
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