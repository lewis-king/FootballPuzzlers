import React, {Component} from 'react';
import {StackNavigator} from 'react-navigation';
import MainMenu from './mainMenu';
import Completed from './completed';
import QuestionContainer from './questionContainer';

const RootNavigator = StackNavigator({
        MainMenu: {screen: MainMenu},
        Questions: {
            screen: QuestionContainer,
            screenProps: {
                isHistoric: ':isHistoric'
            }
        },
        Completed: {screen: Completed},
        initialRouteName: {screen: MainMenu}
    },
    {
        headerMode: 'none',
        navigationOptions: {
            headerVisible: false,
        }
    });

export default RootNavigator;