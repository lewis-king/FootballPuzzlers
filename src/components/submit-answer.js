import React, {Component} from 'react';
import {StyleSheet, Text, TouchableOpacity, TextInput, View} from 'react-native';
import VerifyAnswer from '../services/verify-answer';
import QuestionsDAO from '../dao/questions-dao';

export default class SubmitAnswer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            givenAnswer: 'Enter answer',
            question: props.question,
            action: props.action,
            submitBtnTxt: props.submitBtnTxt,
            isHistoric: props.isHistoric
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            givenAnswer: 'Enter answer',
            question: nextProps.question,
            action: nextProps.action
        })
    }

    onSubmit = () => {
        const givenAnswer = this.state.isHistoric ? this.state.question.acceptableAnswers.split(",")["0"]
            : this.state.givenAnswer;
        console.log("Given answer is: " + givenAnswer);
        const isCorrect = VerifyAnswer(givenAnswer, this.state.question);
        console.log("isCorrect?: " + isCorrect);
        if (isCorrect) {
            if (!this.state.isHistoric) {
                QuestionsDAO.updateQuestion(this.state.question.id);
            }
            this.state.action();
        } else {
            //do nothing
        }
    }

    render() {
        const {submitBtn, submitTxt, textInput} = styles;
        return (
        <View>
            <TextInput style={textInput}
                       onChangeText={(givenAnswer) => this.setState({givenAnswer})}
                       value={this.state.isHistoric ? this.state.question.acceptableAnswers.split(",")["0"] : this.state.text}>
            </TextInput>
            <TouchableOpacity onPress={this.onSubmit} style={submitBtn}>
                <Text style={submitTxt}>{this.state.submitBtnTxt}</Text>
            </TouchableOpacity>
        </View>
        );
    }
}

const styles = StyleSheet.create({
    submitBtn: {
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
        fontFamily: 'cabin',
        fontWeight: 'bold',
        fontSize: 20
    },
    textInput: {
        height: 45,
        borderWidth: 2,
        borderColor: '#fffdfe',
        borderRadius: 5,
        fontSize: 20,
        fontFamily: 'cabin_bold_italic',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.20)'
    }
});