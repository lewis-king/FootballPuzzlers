import React, {Component} from 'react';
import {Image, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View, ScrollView, Platform} from 'react-native';
import {Fonts} from "../utils/fonts";
import CategoryMeta from './categoryMeta';
import QuestionsIntegrityDisclaimer from './questionsIntegrityDisclaimer';
import Theme from '../services/theme';
import Categories from '../services/category';
import QuestionsDAO from "../dao/questions-dao";
import * as Animatable from "react-native-animatable";

export default class QuestionSelector extends Component {

  static navigationOptions = ({navigation}) => {
    const {category} = navigation.state.params;
    // This is a hack to stop the back button on the question screen from showing anything other than 'back'.
    const title = '      ' + Categories[category] + '      ';
    const backgroundColor = Theme[category].main;
    return {
      title,
      headerStyle: {
        backgroundColor,
        borderBottomWidth: 0
      },
      headerTitleStyle: {
        fontFamily: Fonts.Main,
        fontWeight: 'bold'
      },
      headerTintColor: 'white'
    }
  };

  constructor(props) {
    super(props);
    const {category, questions, refreshProgress} = this.props.navigation.state.params;
    this.state = {
      category,
      questions,
      refreshProgress,
      selectableQuestionAnimation: this.flushSelectableQuestionAnimation(questions),
      navigation: this.props.navigation
    }
  }

  flushSelectableQuestionAnimation = (questions) => {
    const selectableQuestionAnimation = [];
    questions.forEach((question) => selectableQuestionAnimation.push(''));
    return selectableQuestionAnimation;
  };

  retrieveAllQuestions = () => {
    let questions = QuestionsDAO.retrieveAllQuestions();
    questions = this.state.questions.filter(question => question.category == this.state.category);
    console.log('about to set questions to state: ' +questions);
    this.setState({
      questions
    });
    console.log('questions stored in state: ' + this.state.questions);
  };

  setQuestion = (question, refreshProgress) => {
      this.props.navigation.navigate('Questions', {category: this.state.category, question, isHistoric: question.answered, refreshProgress, refreshQuestionSelectorProgress: this.retrieveAllQuestions})
  };

  onQuestionSelect = (question, index) => {
    if (index != 0 && !((!question.answered && this.state.questions[index - 1].answered === true) || question.answered)) {
      const currentUnansweredQuestion = this.state.questions.findIndex(question => !question.answered);
      const newSelectableQuestionAnimation = this.flushSelectableQuestionAnimation(this.state.questions);
      newSelectableQuestionAnimation[index] = 'shake';
      newSelectableQuestionAnimation[currentUnansweredQuestion] = 'pulse';
      this.setState({
        selectableQuestionAnimation: newSelectableQuestionAnimation
      })
    } else {
      this.setState({
        selectableQuestionAnimation: this.flushSelectableQuestionAnimation(this.state.questions)
      });
      this.setQuestion(question, this.state.refreshProgress)
    }
  };

  render() {
    const {answeredSelectableQuestion, headerSection, headerText, mainBackground, mainContentContainer, selectableQuestion, selectableQuestionsContainer, selectableQuestionContent, selectableQuestionText} = styles;
    const AnimatableTouchableHighlight = Animatable.createAnimatableComponent(TouchableHighlight);

    const header = (Platform.OS === 'ios') ? null : <View style={[headerSection, {backgroundColor: Theme[this.state.category].main}]}>
      <Text style={headerText}>{Categories[this.state.category]}</Text>
    </View>;

    return (
    <View style={mainBackground}>
      {header}
      <ScrollView contentContainerStyle={selectableQuestionsContainer}>
        <View>
          <CategoryMeta category={this.state.category} questions={this.state.questions} answeredQuestions={this.state.questions.filter(q => q.answered).length} transparent={true} navigation={this.state.navigation} refreshProgress={this.state.refreshProgress}/>
        <View style={selectableQuestionsContainer}>
          {this.state.questions.map((question, index) => (
            <AnimatableTouchableHighlight animation={this.state.selectableQuestionAnimation[index]}
                                          useNativeDriver={true}
                                          onPress={() => this.onQuestionSelect(question, index)}
                                          style={[selectableQuestion, {borderColor: Theme[this.state.category].main}, question.answered ? answeredSelectableQuestion : selectableQuestion, question.answered ? {backgroundColor: Theme[this.state.category].main} : {backgroundColor: Theme[this.state.category].transparent}]}
                                          key={index}>
              <View style={selectableQuestionContent}>
                <Text style={selectableQuestionText}>
                  {index + 1}
                </Text>
              </View>
            </AnimatableTouchableHighlight>
          ))}
        </View>
        </View>
      </ScrollView>
    </View>)
  }


};

const styles = StyleSheet.create({

  mainBackground: {
    flex: 1,
    backgroundColor: '#0E1B2F',
  },
  mainContentContainer: {
    marginTop: 10,
    flexDirection: 'column',
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