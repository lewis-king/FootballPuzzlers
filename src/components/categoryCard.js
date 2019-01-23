import React from 'React';
import {Image, StyleSheet, Text, TouchableHighlight, View} from "react-native";
import {Fonts} from '../utils/fonts';
import CategoryMeta from './categoryMeta';
import Icon from "react-native-vector-icons/Ionicons";
import Categories from '../services/category';

const images = {
  ENG1: {
    uri: require('../resources/images/football_nike.jpg')
  },
  WC: {
    uri: require('../resources/images/football_world_cup.jpg')
  },
  CL: {
    uri: require('../resources/images/football_champions_league.jpg')
  }
};

const CategoryCard = ({title, category, questions, navigation, refreshProgress}) => {
  const {categoryMetaHeading, categoryMetaSubHeading, categoryMetaContainer, categoryMeta, categoryTitle, image} = styles;
  console.log('imageSrc is: ' +images[category].uri);
  const imageSrc = images[category].uri;
  const answeredQuestions = questions.filter(q => q.answered).length;
  return (
    <View>
      {/*<Icon name="ios-lock" size={45} color="#FFFFFF" />*/}
      <View style={categoryTitle}>
        <Text style={categoryMetaHeading}>{title}</Text>
      </View>
      <View>
        <Image borderRadius={5} style={image} source={imageSrc}/>
      </View>
      <TouchableHighlight onPress={() =>
        navigation.navigate('QuestionSelector', {category: category, questions, refreshProgress})}>
        <CategoryMeta category={category} questions={questions} answeredQuestions={answeredQuestions} transparent={false}/>
      </TouchableHighlight>
    </View>
  )
};

const styles = StyleSheet.create({
  categoryMetaHeading: {
    color: '#FFFFFF',
    fontFamily: Fonts.Main,
    fontSize: 16
  },
  categoryTitle: {
    marginTop: 15,
    marginBottom: 5
  },
  image: {
    height: 170,
    width: 370
  }
});

export default CategoryCard;