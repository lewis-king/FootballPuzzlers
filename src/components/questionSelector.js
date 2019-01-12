import React, {Component} from 'react';
import {Image, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View, ScrollView} from 'react-native';
import Header from "./header";
import {Fonts} from "../utils/fonts";
import {setCurrentQuestion} from '../actions/question';
import connect from "react-redux/es/connect/connect";

export default class QuestionSelector extends Component {

  setQuestion = (question) => {
      this.props.navigation.navigate('Questions', {question, isHistoric: question.answered})
  };

  render() {
    const {category, questions} = this.props.navigation.state.params;
    const {answeredSelectableQuestion, mainBackground, selectableQuestion, selectableQuestionsContainer, selectableQuestionContent, selectableQuestionText} = styles;
    return (
    <View style={mainBackground}>
      <Header text={category}/>
      <ScrollView contentContainerStyle={selectableQuestionsContainer}>
        <View style={selectableQuestionsContainer}>
          {questions.map((question, index) => (
            <TouchableHighlight onPress={() => this.setQuestion(question)} style={[selectableQuestion, question.answered ? answeredSelectableQuestion : selectableQuestion]} key={index}>
              <View style={selectableQuestionContent}>
                <Text style={selectableQuestionText}>
                  {++index}
                </Text>
              </View>
            </TouchableHighlight>
          ))}
        </View>
      </ScrollView>
    </View>)
  }


};

const styles = StyleSheet.create({

  mainBackground: {
    flex: 1,
    backgroundColor: '#0E1B2F'
  },
  selectableQuestionsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginLeft: 10,
    marginRight: 10
  },
  selectableQuestionContent: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectableQuestionText: {
    color: '#ffffff',
    fontFamily: Fonts.Cabin,
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  selectableQuestion: {
    backgroundColor: 'rgba(255, 0, 88, 0.1)',
    borderColor: 'rgba(255, 0, 88, 1)',
    borderWidth: 2,
    borderRadius: 10,
    height: 70,
    width: 70,
    margin: 10
  },
  answeredSelectableQuestion: {
    backgroundColor: 'rgba(255, 0, 88, 1)',
  }
});