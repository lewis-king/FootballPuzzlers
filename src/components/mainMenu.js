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
import * as RNIap from 'react-native-iap';
import {itemSkus} from '../services/in-app-purchase';
import QuestionsIntegrityDisclaimer from "./questionsIntegrityDisclaimer";

export default class MainMenu extends Component {

    static navigationOptions = {
      headerStyle: {
        backgroundColor: '#0E1B2F',
        borderBottomWidth: 0
      }
    };

    constructor(props) {
      super(props);
      QuestionsDAO.preLoadQuestions(baseQuestions);
      this.state = {
          questions: []
      }
    }

    async componentDidMount() {
      console.log("In component will mount!");
      let products;
      try {
        //products = await RNIap.getProducts(itemSkus);
        console.log("Successfully retrieved user's products");
        products = [
          {
            title: 'Champions League',
            productId: 'com.footballwhoami.championsleague'
          },
          {
            title: 'World Cup',
            productId: 'com.footballwhoami.worldcup'
          }];
        this.setState({products});
      } catch(err) {
        console.warn("Unable to fetch IAP products, probably because this is a dev environment");
        products = [
            {
              title: 'Champions League',
              productId: 'com.footballwhoami.championsleague'
            },
            {
              title: 'World Cup',
              productId: 'com.footballwhoami.worldcup'
            }];
        this.setState({products});
      }
      this.retrieveAllQuestions();
    }

    retrieveAllQuestions = () => {
      const questions = QuestionsDAO.retrieveAllQuestions();
      console.log('about to set questions to state: ' +questions);
      this.setState({
        questions
      });
    };

    render() {
      const {group,mainBackground, titleInfo} = styles;
      if (!this.state.questions.length > 0) {
          return null;
      }
      console.log('category questions are: ' +this.state.questions.filter(question => question.category == 'ENG1'));
      const eng1Qs = this.state.questions.filter(question => question.category == 'ENG1');
      const wcQs = this.state.questions.filter(question => question.category == 'WC');
      const clQs = this.state.questions.filter(question => question.category == 'CL');
        return (
            <View style={mainBackground}>
              <Header text={"Welcome"}/>
              <Text style={titleInfo}>Test your football knowledge - whoami?</Text>
              <ScrollView contentContainerStyle={group}>
                  <View style={group}>
                    <CategoryCard title={"The Starter Pack"} category={'ENG1'} questions={eng1Qs} navigation={this.props.navigation} refreshProgress={this.retrieveAllQuestions} />
                    <CategoryCard title={"World Cup"} category={'WC'} questions={wcQs} navigation={this.props.navigation} refreshProgress={this.retrieveAllQuestions} product={this.state.products.find((product) => product.productId === 'com.footballwhoami.worldcup')}/>
                    <CategoryCard title={"Champions League"} category={'CL'} questions={clQs} navigation={this.props.navigation} refreshProgress={this.retrieveAllQuestions} product={this.state.products.find((product) => product.productId === 'com.footballwhoami.championsleague')}/>
                  </View>
                <QuestionsIntegrityDisclaimer/>
                <View style={{height: 20}}/>
                </ScrollView>
            </View>
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