import React from 'React';
import {Image, ImageBackground, StyleSheet, Text, TouchableHighlight, View} from "react-native";
import {Fonts} from '../utils/fonts';
import CategoryMeta from './categoryMeta';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Categories from '../services/category';
import UnlockText from "./unlockText";
import QuestionsDAO from "../dao/questions-dao";
import UnlockImg from "./unlockImg";

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

const CategoryCard = ({title, category, questions, navigation, refreshProgress, product}) => {
  const {categoryMetaHeading, categoryMetaSubHeading, categoryMetaContainer, categoryMeta, categoryTitle, image} = styles;
  console.log('imageSrc is: ' +images[category].uri);
  const imageSrc = images[category].uri;
  const answeredQuestions = questions.filter(q => q.answered).length;
  return (
    <View>
      {/*<Icon name="ios-lock" size={45} color="#FFFFFF" />*/}
      <View style={categoryTitle}>
        <View style={{alignItems: 'flex-start'}}>
          <Text style={categoryMetaHeading}>{title}</Text>
        </View>
        <View style={{justifyContent: 'flex-end'}}>
          <UnlockText category={category} product={product}/>
        </View>
      </View>
      <View>
        <ImageBackground borderRadius={5} style={image} source={imageSrc}>
          <UnlockImg category={category} product={product}/>
        </ImageBackground>
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
  categoryMetaSubHeading: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: Fonts.Main
  },
  categoryTitle: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 5
  },
  image: {
    height: 170,
    width: 370
  }
});

export default CategoryCard;