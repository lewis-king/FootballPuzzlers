import React, {Component} from 'react';
import {Animated, StyleSheet, Text, TouchableOpacity, TextInput, View} from 'react-native';
import VerifyAnswer from '../services/verify-answer';
import QuestionsDAO from '../dao/questions-dao';
import * as Animatable from 'react-native-animatable';

export default class SubmitAnswer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            givenAnswer: props.givenAnswer,
            question: props.question,
            action: props.action,
            submitBtnTxt: props.submitBtnTxt,
            isHistoric: props.isHistoric,
            submitBtnBackColor: new Animated.Value(0),
            isChecking: false,
            targetColor: 'rgba(212, 62, 42, 1)',
            submitBtnAnimation: ""
        }
    }

    componentWillReceiveProps(nextProps) {
        console.log("component will receive props");
        this.setState({
            givenAnswer: nextProps.givenAnswer,
            question: nextProps.question,
            action: nextProps.action
        })
    }

    nextQuestion() {
        console.log("Question answered correctly, moving onto next...");
        QuestionsDAO.updateQuestion(this.state.question.id);
        const submitTxt = this.state.isHistoric ? "Next" : "Submit";
        this.setState({
            givenAnswer: '',
            submitBtnTxt: submitTxt
        });
        this.state.action();
    }

    onSubmit = () => {
        const givenAnswer = this.state.isHistoric ? this.state.question.acceptableAnswers.split(",")["0"]
            : this.state.givenAnswer;
        console.log("Given answer is: " + givenAnswer);
        const isCorrect = VerifyAnswer(givenAnswer, this.state.question);
        console.log("isCorrect?: " + isCorrect);
        if (isCorrect) {
            if (!this.state.isHistoric) {
                this.setState({
                    targetColor: 'rgba(63, 104, 28, 1)'
                }, this.animateSubmitBtn("Correct!", () => {
                    this.flushSubmitBtnState(true);
                    this.nextQuestion()
                }));
            } else {
                this.nextQuestion();
            }
        } else {
            this.setState({
                targetColor: 'rgba(212, 62, 42, 1)'
            });
            this.animateSubmitBtn("Incorrect, try again", () => {
                console.log("Incorrect answer, animated fail scenario");
                this.flushSubmitBtnState(false);
            });
        }
    };

    flushSubmitBtnState = (isCorrect) => {
        const submitTxt = this.state.isHistoric ? "Next" : "Submit";
        this.setState({
            givenAnswer: this.state.givenAnswer,
            submitBtnBackColor: new Animated.Value(0),
            submitBtnTxt: submitTxt,
            submitBtnAnimation: ""
        })
    };

    animateSubmitBtn = (submitBtnTxt, callback) => {
        const submitBtnAnimation = submitBtnTxt === "Correct!" ? "tada" : "shake";
        this.setState({
            isChecking: true
        });
        Animated.sequence([
            Animated.timing(this.state.submitBtnBackColor, {
                delay: 1000,
                duration: 1000,
                toValue: 1
            })
        ]).start(() => {
            this.setState({
                isChecking: false,
                submitBtnTxt,
                submitBtnAnimation
            });
            setTimeout(callback, 2000);
        });
    };

    render() {
        const {submitBtn, submitTxt, textInput} = styles;
        const AnimatedButton = Animated.createAnimatedComponent(TouchableOpacity);
        const submitBtnBackColor = this.state.submitBtnBackColor.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(34, 92, 105, 1)', this.state.targetColor]
        });
        return (
        <View>
            <TextInput style={textInput}
                       placeholder={"Enter answer..."}
                       onChangeText={(givenAnswer) => this.setState({givenAnswer})}
                       value={this.state.isHistoric ? this.state.question.acceptableAnswers.split(",")["0"] : this.state.givenAnswer}
                       editable={!this.state.isHistoric}>
            </TextInput>
            <AnimatedButton onPress={this.onSubmit} style={[submitBtn, {backgroundColor: submitBtnBackColor}]}
            disabled={this.state.isChecking}>
                <Animatable.Text animation={this.state.submitBtnAnimation} style={submitTxt}>{this.state.isChecking ? 'Checking...' : this.state.submitBtnTxt}</Animatable.Text>
            </AnimatedButton>
        </View>
        );
    }
}

const styles = StyleSheet.create({
    submitBtn: {
        alignSelf: 'stretch',
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
        fontFamily: 'Cabin-BoldItalic',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.20)'
    }
});