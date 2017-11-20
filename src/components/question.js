import React from 'React';
import {StyleSheet, Text} from 'react-native';

const Question = (props) => {
    const {question} = props;
    const {questionStyle} = styles;
    //console.log(question)
    if (!question) return null;
    return <Text style={questionStyle}>{question.question}</Text>
}

const styles = StyleSheet.create({
    questionStyle: {
        margin: 10,
        fontFamily: 'cabin',
        fontWeight: 'bold',
        fontSize: 17,
        textShadowColor: '#252525',
        shadowOffset: {width: 2, height: 2},
        textShadowRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.40)',
        padding: 2,
        borderRadius: 5
    },
});
export default Question;
