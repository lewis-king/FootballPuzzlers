import React from 'React';
import {Dimensions, ImageBackground, StyleSheet, Text, TouchableHighlight, View} from "react-native";
import {Fonts} from '../utils/fonts';
import CategoryMeta from './categoryMeta';
import UnlockText from "./unlockText";
import UnlockImg from "./unlockImg";
import {unlockAlert} from '../services/in-app-purchase/alert';

const images = {
  ENG1: {
    uri: require('../resources/images/football_nike.jpg')
  },
  WC: {
    uri: require('../resources/images/football_world_cup_2.jpg')
  },
  CL: {
    uri: require('../resources/images/football_champions_league.jpg')
  }
};

const CategoryCard = ({title, category, questions, productUnlockOverride, navigation, refreshProgress, product}) => {
  const {categoryMetaHeading, categoryTitle, image} = styles;
  const imageSrc = images[category].uri;
  const answeredQuestions = questions.filter(q => q.answered).length;
  const productUnlocked = category === "ENG1" || product == undefined || !product.locked || productUnlockOverride || answeredQuestions > 0;
  return (
    <View>
      <View style={categoryTitle}>
        <View style={{alignItems: 'flex-start'}}>
          <Text style={categoryMetaHeading}>{title}</Text>
        </View>
        <View style={{justifyContent: 'flex-end'}}>
          <UnlockText category={category} product={product} productUnlocked={productUnlocked} refresh={refreshProgress}/>
        </View>
      </View>
      <TouchableHighlight onPress={() =>{
        if (productUnlocked) {
          navigation.navigate('QuestionSelector', {category: category, questions, refreshProgress})
        } else {
          unlockAlert(product, refreshProgress)
        }
      }}>
      <View>
        <ImageBackground borderRadius={5} style={image} source={imageSrc} resizeMethod={'resize'}>
          <UnlockImg category={category} product={product} productUnlocked={productUnlocked}/>
        </ImageBackground>
      </View>
      </TouchableHighlight>
        <CategoryMeta category={category} questions={questions} answeredQuestions={answeredQuestions} transparent={false} navigation={navigation} refreshProgress={refreshProgress} productUnlocked={productUnlocked} product={product}/>
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
    flex: 1,
    alignSelf: 'center',
    height: Dimensions.get('window').height * 0.225,
    width: Dimensions.get('window').width * 0.90
  }
});

export default CategoryCard;