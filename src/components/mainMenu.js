import React, {Component} from 'react';
import {Image, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View, ScrollView} from 'react-native';
import {Card, CardTitle, CardContent, CardAction, CardButton, CardImage} from 'react-native-cards';
import {StackNavigator} from 'react-navigation';
import Header from './header';
import QuestionsDAO from '../dao/questions-dao';
import baseQuestions from '../../config/baseQuestions.json';
import {Fonts} from '../utils/fonts';
import {BACKGROUND_IMAGE} from "../resources/images/index";
import CategoryCard from "./categoryCard";
import {setQuestions} from "../actions/question";
import { connect } from 'react-redux';

export default class MainMenu extends Component {

    constructor(props) {
      super(props);
      QuestionsDAO.preLoadQuestions(baseQuestions);
      this.state = {
          questions: []
      }
    }

    componentDidMount() {
      console.log("In component will mount!");
      this.retrieveAllQuestions();
    }

    retrieveAllQuestions = () => {
      const questions = QuestionsDAO.retrieveAllQuestions();
      console.log('about to set questions to state: ' +questions);
      this.setState({
        questions
      });
      console.log('questions stored in state: ' + this.state.questions);
    };

    render() {
        const {group,mainBackground, titleInfo} = styles;
        //console.log('all questions are: ' +this.state.questions);
        //console.log('category questions ENG1 are: ' + this.state.questions.filtered('category == ENG1'));
      if (!this.state.questions.length > 0) {
          return null;
      }
      console.log('category questions are: ' +this.state.questions.filter(question => question.category == 'ENG1'));
      const eng1Qs = this.state.questions.filter(question => question.category == 'ENG1');
      const wcQs = this.state.questions.filter(question => question.category == 'WC');
      const clQs = this.state.questions.filter(question => question.category == 'CL');
        return (
            <View style={mainBackground}>
              <Header text={"Welcome!"}/>
              <Text style={titleInfo}>Test your football knowledge - whoami?</Text>
              <ScrollView contentContainerStyle={group}>
                    <View style={group}>
                      <CategoryCard title={"The Starter Pack"} category={'ENG1'} questions={eng1Qs} navigation={this.props.navigation} refreshProgress={this.retrieveAllQuestions} />
                      <CategoryCard title={"World Cup"} category={'WC'} questions={wcQs} navigation={this.props.navigation} refreshProgress={this.retrieveAllQuestions} />
                      <CategoryCard title={"Champions League"} category={'CL'} questions={clQs} navigation={this.props.navigation} refreshProgress={this.retrieveAllQuestions} />
                    </View>
                    <View style={{height: 20}}/>
                </ScrollView>
            </View>


                        /*
                        <TouchableOpacity onPress={() =>
                            this.props.navigation.navigate('Questions',
                                {isHistoric: false, refreshProgress: this.refreshProgress})} style={btnStyle}>
                            <Text style={submitTxt}>{this.state.userProgress === 0 ? "Start" : "Continue"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() =>
                            this.props.navigation.navigate('Questions',
                                {isHistoric: true, refreshProgress: this.refreshProgress})} style={btnStyle}>
                            <Text style={submitTxt}>Question History</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() =>
                            this.props.navigation.navigate('HowToPlay')} style={btnStyle}>
                            <Text style={submitTxt}>How to play</Text>
                        </TouchableOpacity>
                        <Text style={progressTxt}>
                            Progress: {this.state.userProgress}%
                        </Text>*/
        )
    }
}

const styles = StyleSheet.create({
    group: {
      flexDirection: 'column',
      marginRight: 10,
      marginLeft: 10,
      marginTop: 10
    },
    mainBackground: {
        flex: 1,
        backgroundColor: '#0E1B2F'
    },
    titleInfo: {
      marginLeft: 20,
      fontFamily: Fonts.Main,
      fontSize: 14,
      color: 'white'
    }
});