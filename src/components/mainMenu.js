import React, {Component} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {StackNavigator} from 'react-navigation';
import Header from './header';
import QuestionsDAO from '../dao/questions-dao';
import baseQuestions from '../../config/baseQuestions.json';
import {Fonts} from '../../src/utils/font';
import {BACKGROUND_IMAGE} from "../resources/images/index";

export default class MainMenu extends Component {

    constructor(props) {
        super(props);
        QuestionsDAO.preLoadQuestions(baseQuestions);
    }

    componentWillMount() {
        console.log("In component will mount!");
        const userProgress = QuestionsDAO.retrieveUserProgress() + "%";
        this.setState({
            userProgress
        })
    }

    componentDidMount() {
        console.log("component did mount!");
    }

    componentWillReceiveProps(newProps) {
        console.log("component will receive props");
    }

    render() {
        const {btnStyle, container, content, image, submitTxt, progressTxt} = styles;
        return (
            <View style={container}>
                <Image source={BACKGROUND_IMAGE} style={image}>
                    <View style={content}>
                        <Header text={'Football - Who am I?'}/>
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
                </Image>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: 'rgba(255, 255, 255, 0.55)'
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
        flex: 1,
        width: null,
        height: null,
        backgroundColor: 'transparent',
        resizeMode: 'cover',
    },
    submitTxt: {
        alignSelf: 'center',
        color: '#fffdfe',
        paddingTop: 10,
        paddingBottom: 10,
        fontWeight: 'bold',
        fontSize: 20,
        fontFamily: Fonts.Cabin
    },
    progressTxt: {
        alignSelf: 'center',
        color: '#2a2222',
        paddingTop: 10,
        paddingBottom: 10,
        fontWeight: 'bold',
        fontSize: 20,
        fontFamily: Fonts.Cabin
    }
});