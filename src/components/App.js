import React, { Component } from 'react';

import rootReducer from '../reducers';

import { Provider } from 'react-redux';
import { createStore } from 'redux';
import {StackNavigator} from "react-navigation";
import MainMenu from "./mainMenu";
import QuestionSelector from "./questionSelector";
import QuestionContainer from "./questionContainer";
import Completed from "./completed";
import HowToPlay from "./howToPlay";
import {Platform, View} from "react-native";

const store = createStore(rootReducer);

export const RootNavigator = StackNavigator({
    MainMenu: {
      screen: MainMenu,
      screenProps: {
        category: ':category',
        questions: ':questions'
      }
    },
    QuestionSelector: {
      screen: QuestionSelector,
      screenProps: {
        question: ':question',
        category: ':category'
      }
    },
    Questions: {
      screen: QuestionContainer,
      screenProps: {
        question: ':question',
        category: ':category',
        isHistoric: ':isHistoric',
        refreshProgress: ':refreshProgress'
      },
    },
    Completed: {screen: Completed},
    HowToPlay: {screen: HowToPlay},
    initialRouteName: {screen: MainMenu}
  },
  {
    headerMode: Platform.OS === 'ios' ? 'float' : 'none',
    navigationOptions: {
      headerVisible: true,
    }
  });

export default class App extends Component {
  render() {
    return (
      <RootNavigator />
    )
  }
}