import React, {Component} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, ScrollView, TouchableHighlight, FlatList} from 'react-native';
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
      await this.retrieveAllQuestions();
    }

    retrieveAllQuestions = async () => {
      let products;
      try {
        products = await getProducts();
      } catch(err) {
        console.warn(err.code);
        console.warn(err.message);
      }
      const questions = QuestionsDAO.retrieveAllQuestions();
      console.log('about to set questions to state: ' +questions);
      //set allowedToOpenNewSection boolean
      //This will be derived based on if sections that have at least a question answered and all are answered return true
      //This will then be used to drive whether the locked sections can be shown.
      this.setState({
        questions,
        products
      });
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
        return (
            <View style={mainBackground}>
              <ScrollView contentContainerStyle={group}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Heading text={"Welcome"}/>
                <View style={{marginRight: 15}}>
                  <TouchableOpacity onPress={() => this.setState({helpModalVisible: true})}>
                    <Icon name="help-box" size={34} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <Modal style={{margin: 0, marginTop: 20}} isVisible={this.state.helpModalVisible} animationIn="slideInDown">
                  <View style={helpOverlay}>
                    <View style={closeOverlay}>
                      <TouchableHighlight onPress={() => this.setState({helpModalVisible: false})}>
                        <Icon name="close" size={36} color="#FFFFFF" />
                      </TouchableHighlight>
                    </View>
                    <HowToPlay/>
                  </View>
                </Modal>
              </View>
              <Text style={titleInfo}>Test your football knowledge - whoami?</Text>
                  <View style={group}>
                    <CategoryCard title={"The Starter Pack"} category={'ENG1'} questions={eng1Qs} navigation={this.props.navigation} refreshProgress={this.retrieveAllQuestions} />
                    <CategoryCard title={"World Cup"} category={'WC'} questions={wcQs} navigation={this.props.navigation} refreshProgress={this.retrieveAllQuestions} product={this.state.products.find((product) => product.productId === 'com.footballwhoami.worldcup')}/>
                    <CategoryCard title={"Champions League"} category={'CL'} questions={clQs} navigation={this.props.navigation} refreshProgress={this.retrieveAllQuestions} product={this.state.products.find((product) => product.productId === 'com.footballwhoami.championsleague')}/>
                  </View>
                <QuestionsIntegrityDisclaimer/>
                <TouchableOpacity onPress={emailHandler}>
                <Heading text={"Notice something wrong?"} size={14} alignment={"center"}/>
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
      backgroundColor: '#0E1B2F'
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
      marginLeft: 20,
      fontFamily: Fonts.Main,
      fontSize: 14,
      color: 'white'
    }
});