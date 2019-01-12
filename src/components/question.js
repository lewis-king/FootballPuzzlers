import React from 'React';
import {StyleSheet, Text} from 'react-native';
import {Fonts} from '../utils/fonts';

const Question = (props) => {
    const {question} = props;
    const {questionStyle} = styles;
    //console.log(question)
    if (!question) return null;
    return <Text style={questionStyle}>{question.question}</Text>
};

const styles = StyleSheet.create({
    questionStyle: {
        color: 'white',
        margin: 10,
        fontFamily: Fonts.Cabin,
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
        textShadowColor: '#252525',
        shadowOffset: {width: 2, height: 2},
        textShadowRadius: 15,
        padding: 2,
        borderRadius: 5
    },
});
export default Question;
