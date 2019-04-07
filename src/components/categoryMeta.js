import {Text, StyleSheet, View, TouchableHighlight} from "react-native";
import React from "react";
import {Fonts} from "../utils/fonts";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Theme from '../services/theme';
import {unlockAlert} from '../services/in-app-purchase/alert';

const renderMeta = (category, questions, answeredQuestions, transparent, navigation, refreshProgress, productUnlocked, product) => {
  const {categoryMeta, categoryMetaContainer, categoryMetaHeading, categoryMetaSubHeading} = styles;
  if (questions.filter(q => !q.answered).length === 0) {
    return (
      <TouchableHighlight disabled={transparent || !productUnlocked} onPress={() =>
        navigation.navigate('QuestionSelector', {category: category, questions, refreshProgress})}>
      <View style={[categoryMetaContainer, transparent ? {backgroundColor: 'rgba(14, 221, 153, 0)'} : {backgroundColor: 'rgba(14, 221, 153, 100)'}, {justifyContent: 'center'}]}>
        <View style={[categoryMeta, {alignItems: 'center', marginTop: 5, marginBottom: 5}]}>
          <Icon name="check" size={40} color="#FFFFFF" />
          <Text style={[categoryMetaSubHeading, {fontSize:18}]}>Complete</Text>
        </View>
      </View>
      </TouchableHighlight>
    )
  } else {
    return (
      <TouchableHighlight disabled={transparent} onPress={() => {
        if (productUnlocked) {
          navigation.navigate('QuestionSelector', {category: category, questions, refreshProgress})
        } else {
          unlockAlert(product, refreshProgress)
        }
      }}>
      <View style={[categoryMetaContainer, transparent ? {backgroundColor: 'rgba(255, 255, 255, 0)'} : {backgroundColor: Theme[category].main}]}>
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
      </TouchableHighlight>
    )
  }
};

const CategoryMeta = ({category, questions, answeredQuestions, transparent, navigation, refreshProgress, productUnlocked, product}) => {
  return (renderMeta(category, questions, answeredQuestions, transparent, navigation, refreshProgress, productUnlocked, product))
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

