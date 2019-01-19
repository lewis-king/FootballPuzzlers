import {Text, StyleSheet, View} from "react-native";
import React from "react";
import {Fonts} from "../utils/fonts";

const CategoryMeta = ({questions, answeredQuestions, transparent}) => {
  const {categoryMeta, categoryMetaContainer, categoryMetaHeading, categoryMetaSubHeading} = styles;
  return <View style={[categoryMetaContainer, transparent ? {backgroundColor: 'rgba(255, 255, 255, 0)'} : {backgroundColor: '#6C4AD0'}]}>
    <View style={categoryMeta}>
      <Text style={categoryMetaHeading}>Questions</Text>
      <Text style={categoryMetaSubHeading}>{questions.length}</Text>
    </View>
    <View style={categoryMeta}>
      <Text style={categoryMetaHeading}>Progress</Text>
      <Text style={categoryMetaSubHeading}>{answeredQuestions}/{questions.length}</Text>
    </View>
    <View style={categoryMeta}>
      <Text style={categoryMetaSubHeading}>{Math.round((answeredQuestions / questions.length) * 100)}%</Text>
    </View>
  </View>
};

export default CategoryMeta;

const styles = StyleSheet.create({
  categoryMetaHeading: {
    color: '#FFFFFF',
    fontFamily: Fonts.Main,
    fontSize: 16
  },
  categoryMetaSubHeading: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: Fonts.Main
  },
  categoryMetaContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#6C4AD0',
    borderRadius: 10,
    paddingLeft: 20,
    paddingRight: 20,
    height: 70,
    marginTop: 5,
    marginBottom: 10
  },
  categoryMeta: {
    flexDirection: 'column',
    fontFamily: Fonts.Main
  }
});

