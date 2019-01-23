import React, {Component} from 'react';
import {Image, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View, ScrollView} from 'react-native';
import Header from "./header";
import {Fonts} from "../utils/fonts";
import CategoryMeta from './categoryMeta';
import QuestionsIntegrityDisclaimer from './questionsIntegrityDisclaimer';
import Theme from '../services/theme';
import Categories from '../services/category';

export default class QuestionSelector extends Component {

  constructor(props) {
    super(props);
    const {category, questions, refreshProgress} = this.props.navigation.state.params;
    this.state = {
      category,
      questions,
      refreshProgress
    }
  }

  setQuestion = (question, refreshProgress) => {
      this.props.navigation.navigate('Questions', {category: this.state.category, question, isHistoric: question.answered, refreshProgress})
  };

  render() {
    const {answeredSelectableQuestion, headerSection, headerText, mainBackground, mainContentContainer, selectableQuestion, selectableQuestionsContainer, selectableQuestionContent, selectableQuestionText} = styles;
    return (
    <View style={mainBackground}>
      <View style={[headerSection, {backgroundColor: Theme[this.state.category]}]}>
        <Text style={headerText}>{Categories[this.state.category]}</Text>
      </View>
      <View style={mainContentContainer}>
        <CategoryMeta questions={this.state.questions} answeredQuestions={this.state.questions.filter(q => q.answered).length} transparent={true}/>
      </View>
      <ScrollView contentContainerStyle={selectableQuestionsContainer}>
        <View style={selectableQuestionsContainer}>
          {this.state.questions.map((question, index) => (
            <TouchableHighlight onPress={() => this.setQuestion(question, this.state.refreshProgress)} style={[selectableQuestion, question.answered ? answeredSelectableQuestion : selectableQuestion]} key={index}>
              <View style={selectableQuestionContent}>
                <Text style={selectableQuestionText}>
                  {++index}
                </Text>
              </View>
            </TouchableHighlight>
          ))}
        </View>
      </ScrollView>
      <QuestionsIntegrityDisclaimer/>
    </View>)
  }


};

const styles = StyleSheet.create({

  mainBackground: {
    flex: 1,
    backgroundColor: '#0E1B2F'
  },
  mainContentContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerSection: {
    backgroundColor: 'rgba(120, 88, 250, 1)'
  },
  headerText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: Fonts.Main,
    fontWeight: 'bold',
    fontSize: 16,
    paddingTop: 10,
    paddingBottom: 10
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
    fontFamily: Fonts.Main,
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  selectableQuestion: {
    backgroundColor: 'rgba(120, 88, 250, 0.1)',
    borderColor: 'rgba(120, 88, 250, 1)',
    borderWidth: 2,
    borderRadius: 10,
    height: 70,
    width: 70,
    margin: 10
  },
  answeredSelectableQuestion: {
    backgroundColor: 'rgba(120, 88, 250, 1)',
  }
});