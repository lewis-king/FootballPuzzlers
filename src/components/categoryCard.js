import React from 'React';
import {Image, StyleSheet, Text, TouchableHighlight, View} from "react-native";

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

const categories = {
  ENG1: "General",
  WC: "World Cup",
  CL: "Champions League"
};

const CategoryCard = ({title, category, questions, navigation}) => {
  const {categoryMetaHeading, categoryMetaSubHeading, categoryMetaContainer, categoryMeta, categoryTitle, image} = styles;
  console.log('imageSrc is: ' +images[category].uri);
  const imageSrc = images[category].uri;
  const answeredQuestions = questions.filter(q => q.answered).length;
  return (
    <View>
      <View style={categoryTitle}>
        <Text style={categoryMetaHeading}>{title}</Text>
      </View>
      <View>
        <Image borderRadius={5} style={image} source={imageSrc}/>
      </View>
      <TouchableHighlight onPress={() =>
        navigation.navigate('QuestionSelector', {category: categories[category], questions})}>
        <View style={categoryMetaContainer}>
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
    </View>
  )
};

const styles = StyleSheet.create({
  categoryMetaHeading: {
    color: '#FFFFFF',
    fontSize: 16
  },
  categoryMetaSubHeading: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold'
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