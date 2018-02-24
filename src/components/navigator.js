import React, {Component} from 'react';
import {Platform} from 'react-native';
import {StackNavigator} from 'react-navigation';
import MainMenu from './mainMenu';
import Completed from './completed';
import HowToPlay from './howToPlay';
import QuestionContainer from './questionContainer';

const RootNavigator = StackNavigator({
        MainMenu: {
            screen: MainMenu,
            navigationOptions: ({ navigation }) => ({ header: null, })},
        Questions: {
            screen: QuestionContainer,
            screenProps: {
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

export default RootNavigator;