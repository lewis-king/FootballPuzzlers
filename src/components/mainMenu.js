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
      const questions = QuestionsDAO.retrieveAllQuestions();
      console.log('about to set questions to state: ' +questions);
      this.setState({
        questions
      });
      console.log('questions stored in state: ' + this.state.questions);
    }

    /*componentWillReceiveProps(newProps) {
        const userProgress = QuestionsDAO.retrieveUserProgress();
        this.setState({
            userProgress
        })
    }*/

    render() {
        const {bannerImage, btnStyle, card, categoryMetaHeading, categoryMetaSubHeading, categoryImage, categoryMetaContainer, categoryMeta, categoryTitle, container, group, content, image, mainBackground, meta, submitTxt, progressTxt} = styles;
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
                <ScrollView contentContainerStyle={group}>
                    <View style={group}>
                      <CategoryCard title={"The Starter Pack"} category={'ENG1'} questions={eng1Qs} navigation={this.props.navigation} />
                      <CategoryCard title={"World Cup"} category={'WC'} questions={wcQs} navigation={this.props.navigation} />
                      <CategoryCard title={"Champions League"} category={'CL'} questions={clQs} navigation={this.props.navigation} />
                    </View>
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
    bannerImage: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'grey',
        alignSelf: 'stretch',
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'stretch',
    },
    card: {
        backgroundColor: '#6C4AD0'
    },
    categoryTitle: {
      marginBottom: 5
    },
    container: {
        flex: 1,
    },
    content: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: 'rgba(255, 255, 255, 0.55)'
    },
    group: {
      flexDirection: 'column',
      marginRight: 10,
      marginLeft: 10,
      marginTop: 20
    },
    btnStyle: {
        alignSelf: 'stretch',
        backgroundColor: '#225c69',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#2f8492',
        paddingTop: 10,
        paddingBottom: 10
    },
    image: {
        height: 170,
        width: 370
    },
    mainBackground: {
        flex: 1,
        backgroundColor: '#0E1B2F'
    },
    meta: {
        flexDirection: 'row'
    },
    submitTxt: {
        alignSelf: 'center',
        color: '#FFFFFF',
        paddingTop: 10,
        paddingBottom: 10,
        fontWeight: 'bold',
        fontSize: 22,
        fontFamily: Fonts.Main
    },
    progressTxt: {
        alignSelf: 'center',
        color: '#2a2222',
        paddingTop: 10,
        paddingBottom: 10,
        fontWeight: 'bold',
        fontSize: 20,
        fontFamily: Fonts.Main
    }
});