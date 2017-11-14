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
            action: props.action
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
        console.log("Given answer is: " + this.state.givenAnswer);
        const isCorrect = VerifyAnswer(this.state.givenAnswer, this.state.question);
        console.log("isCorrect?: " + isCorrect);
        if (isCorrect) {
            QuestionsDAO.updateQuestion(this.state.question.id);
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
                       value={this.state.text}>
            </TextInput>
            <TouchableOpacity onPress={this.onSubmit} style={submitBtn}>
                <Text style={submitTxt}>Submit</Text>
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
        fontWeight: 'bold',
        fontSize: 20
    },
    textInput: {
        height: 40,
        borderWidth: 1,
        borderColor: '#fffdfe',
        borderRadius: 5,
        fontSize: 16,
        fontFamily: 'Roboto',
        backgroundColor: 'rgba(255, 255, 255, 0.20)',
    }
});