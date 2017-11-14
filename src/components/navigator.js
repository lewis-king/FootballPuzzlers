import React, {Component} from 'react';
import {StackNavigator} from 'react-navigation';
import MainMenu from "./mainMenu";
import QuestionContainer from "./questionContainer";

const RootNavigator = StackNavigator({
        MainMenu: {screen: MainMenu},
        Questions: {
            screen: QuestionContainer,
            screenProps: {
                isHistoric: ':isHistoric'
            }
        },
        initialRouteName: {screen: MainMenu}
    },
    {
        headerMode: 'none',
        navigationOptions: {
            headerVisible: false,
        }
    });

export default RootNavigator;