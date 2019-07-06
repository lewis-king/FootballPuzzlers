import React, {Component} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, ScrollView, StatusBar, TouchableHighlight, FlatList} from 'react-native';
import Heading from './heading';
import QuestionsDAO from '../dao/questions-dao';
import baseQuestions from '../../config/baseQuestions.json';
import {Fonts} from '../utils/fonts';
import CategoryCard from "./categoryCard";
import {getProducts} from '../services/in-app-purchase';
import QuestionsIntegrityDisclaimer from "./questionsIntegrityDisclaimer";
import emailHandler from '../services/email';
import Theme from "../services/theme";
import Modal from "react-native-modal";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import HowToPlay from "./howToPlay";

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
          questions: [],
          helpModalVisible: false
      }
    }

    async componentDidMount() {
      console.log("In component will mount!");
      await this.retrieveAllQuestions(true);
    }

    retrieveAllQuestions = async (refreshProducts) => {
      let products;
      if (refreshProducts) {
        try {
          products = await getProducts();
        } catch (err) {
          console.warn(err.code);
          console.warn(err.message);
        }
      }
      const questions = QuestionsDAO.retrieveAllQuestions();
      console.log('about to set questions to state: ' +questions);
      //set allowedToOpenNewSection boolean
      //This will be derived based on if sections that have at least a question answered and all are answered return true
      //This will then be used to drive whether the locked sections can be shown.
      if (products !== undefined) {
        this.setState({
          questions,
          products
        });
      } else {
        this.setState(questions)
      }
    };

    determineAllProductsUnlockedOverride = (questions) => {
      const allCategories = questions.map(question => question.category);
      const distinctCategories = Array.from(new Set(allCategories));
      const categoryStatus = [];
      distinctCategories.forEach(category => {
        const questionsInCategory = this.state.questions.filter(question => question.category == category);
        const unansweredQuestionsInCategory = questionsInCategory.filter(question => !question.answered);
        const completedCategory = unansweredQuestionsInCategory.length === 0;
        const notYetStartedCategory = unansweredQuestionsInCategory.length == questionsInCategory.length;
        const inProgressCategory = !notYetStartedCategory && !completedCategory;
        const status = completedCategory ? "COMPLETED" : notYetStartedCategory ? "NOT_STARTED" : inProgressCategory ? "IN_PROGRESS" : null;
        categoryStatus.push(status)
      });
      const categoriesInProgress = categoryStatus.filter(status => status === "IN_PROGRESS");
      return categoriesInProgress.length === 0 && categoryStatus[0] !== "NOT_STARTED";
    };

    render() {
      const {closeOverlay, helpOverlay, group, mainBackground, titleInfo} = styles;
      if (!this.state.questions.length > 0) {
          return null;
      }
      console.log('category questions are: ' +this.state.questions.filter(question => question.category == 'ENG1'));
      const eng1Qs = this.state.questions.filter(question => question.category == 'ENG1').sort((a, b) => a.questionId - b.questionId);
      const wcQs = this.state.questions.filter(question => question.category == 'WC').sort((a, b) => a.questionId - b.questionId);
      const clQs = this.state.questions.filter(question => question.category == 'CL').sort((a, b) => a.questionId - b.questionId);
      const allProductsUnlockOverride = this.determineAllProductsUnlockedOverride(this.state.questions);
      console.log("AllProductsUnlock is: " +allProductsUnlockOverride);
      return (
            <View style={mainBackground}>
              <StatusBar backgroundColor="#0E1B2F" barStyle="light-content" />
              <ScrollView contentContainerStyle={group}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Heading text={"Welcome"}/>
                <View style={{marginRight: 15}}>
                  <TouchableOpacity onPress={() => this.setState({helpModalVisible: true})}>
                    <Icon name="help-box" size={34} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <Modal style={{margin: 0, marginTop: 20}} isVisible={this.state.helpModalVisible} animationIn="slideInUp">
                  <View style={helpOverlay}>
                    <View style={closeOverlay}>
                      <TouchableHighlight onPress={() => this.setState({helpModalVisible: false})} underlayColor={'white'}>
                        <Icon name="close" size={36} color="black" />
                      </TouchableHighlight>
                    </View>
                    <HowToPlay/>
                  </View>
                </Modal>
              </View>
              <Text style={titleInfo}>How well do you know your football?</Text>
                  <View style={group}>
                    <CategoryCard title={"The Starter Pack"} category={'ENG1'} questions={eng1Qs} productUnlockOverride={allProductsUnlockOverride} navigation={this.props.navigation} refreshProgress={this.retrieveAllQuestions} />
                    <CategoryCard title={"WC"} category={'WC'} questions={wcQs} productUnlockOverride={allProductsUnlockOverride} navigation={this.props.navigation} refreshProgress={this.retrieveAllQuestions} product={this.state.products.find((product) => product.productId === 'com.footballwhoami.worldcup_1')}/>
                    <CategoryCard title={"Champions League"} category={'CL'} questions={clQs} productUnlockOverride={allProductsUnlockOverride} navigation={this.props.navigation} refreshProgress={this.retrieveAllQuestions} product={this.state.products.find((product) => product.productId === 'com.footballwhoami.championsleague_1')}/>
                  </View>
                <QuestionsIntegrityDisclaimer color={"white"}/>
                <TouchableOpacity onPress={emailHandler}>
                <Heading text={"Notice something wrong?"} size={14} alignment={"center"}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={async () => {
                    await this.retrieveAllQuestions(true);
                    if (this.state.products[0].stub) {
                      alert("Could not restore purchases (this requires data)");
                    } else {
                      alert("Successfully restored your previous purchases");
                    }
                }}>
                  <Heading text={"Restore purchases"} size={14} alignment={"center"}/>
                </TouchableOpacity>
                <View style={{height: 40}}/>
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    closeOverlay: {
      alignSelf: 'flex-end',
      color: 'white',
      fontSize: 32,
      marginRight: 30,
      marginTop: 10
    },
    helpOverlay: {
      marginTop: 20,
      borderTopLeftRadius: 55,
      borderTopRightRadius: 55,
      flexDirection: 'column',
      flex: 1,
      backgroundColor: '#ffffff'
    },
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
      marginLeft: 10,
      fontFamily: Fonts.Main,
      fontSize: 14,
      color: 'white'
    }
});