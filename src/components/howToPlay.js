import React from 'React';
import {ScrollView, StyleSheet, Text, View} from "react-native";
import {Fonts} from "../utils/fonts";

const HowToPlay = () => {
    const {container, heading, sectionHeaderStyle, welcomeParaStyle} = styles;
    const welcomePara = "Welcome to Football - Who am I?\n" +
        "A football(soccer) trivia guess who style app in which you will be given certain facts about a player and you must guess who is being described.\n" +
        "The quiz is intended to be difficult so do not be too put off if you find yourself stuck on a question, the game works best with a group of friends so that you can solve the questions together.\n" +
        "If you do find yourself stuck, there are a couple of mechanisms to give you a helping hand which include a number of clues, revealing a letter and an option to share the question to your favourite social media platform.\n";
    const answeringTheQ = "Answering a question";
    const answeringTheQPara = "All questions require you to enter the name of the player being described.\n" +
        "You are only required to enter the player's last name although we do accept you entering the full name, BUT you MUST spell it correctly.\n";
    return (
        <View style={container}>
        <Text style={heading}>How to play...</Text>
        <ScrollView>
            <Text style={welcomeParaStyle}>{welcomePara}</Text>
            <Text style={sectionHeaderStyle}>{answeringTheQ}</Text>
            <Text style={welcomeParaStyle}>{answeringTheQPara}</Text>
        </ScrollView>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(95, 125, 132, 0.30)',
        flex: 1
    },
    heading: {
        textAlign: 'center',
        alignItems: 'center',
        margin: 5,
        fontFamily: Fonts.Cabin,
        fontSize: 30,
        fontWeight: 'bold',
        color: '#ffffff'
    },
    sectionHeaderStyle: {
        fontFamily: Fonts.Cabin,
        fontSize: 25,
        fontWeight: 'bold',
        margin: 5
    },
    welcomeParaStyle: {
        fontFamily: Fonts.Cabin,
        fontSize: 19,
        margin: 5
    }
});

export default HowToPlay;