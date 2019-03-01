import React from 'react';
import {Text, StyleSheet, View} from 'react-native';
import Constants from "../utils/constants";
import {Fonts} from "../utils/fonts";

const QuestionsIntegrityDisclaimer = () => {
  const {integrityDateText} = styles;
  return <View>
    <Text style={integrityDateText}>Questions correct as of {Constants.questionsIntegrityDate}</Text>
  </View>
};

export default QuestionsIntegrityDisclaimer;

const styles = StyleSheet.create({
  integrityDateText: {
    color: 'white',
    margin: 10,
    fontFamily: Fonts.Main,
    fontSize: 14,
    textAlign: 'center'
  },
  integrityDateView: {

  }
});