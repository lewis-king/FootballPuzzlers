import React, {Component} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {StackNavigator} from 'react-navigation';
import Header from './header';
import QuestionDAO from '../dao/questions-dao';

export default class MainMenu extends Component {

    componentWillMount() {
        const userProgress = QuestionDAO.retrieveUserProgress() + "%";
        this.setState({
            userProgress
        })
    }

    render() {
        const {btnStyle, container, submitTxt, progressTxt} = styles;
        return (
            <View style={container}>
                <Header/>
                <TouchableOpacity onPress={() =>
                    this.props.navigation.navigate('Questions', {isHistoric: false})} style={btnStyle}>
                    <Text style={submitTxt}>Start/Continue</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() =>
                    this.props.navigation.navigate('Questions', {isHistoric: true})} style={btnStyle}>
                    <Text style={submitTxt}>Question History</Text>
                </TouchableOpacity>
                <Text style={progressTxt}>
                    Progress: {this.state.userProgress}
                </Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
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
    submitTxt: {
        alignSelf: 'center',
        color: '#fffdfe',
        paddingTop: 10,
        paddingBottom: 10,
        fontWeight: 'bold',
        fontSize: 20
    },
    progressTxt: {
        alignSelf: 'center',
        color: '#2a2222',
        paddingTop: 10,
        paddingBottom: 10,
        fontWeight: 'bold',
        fontSize: 20
    }
});