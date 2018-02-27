import React from 'React';
import {Linking, ScrollView, StyleSheet, Text, View} from "react-native";
import {Fonts} from "../utils/fonts";

const HowToPlay = () => {
    const {container, heading, sectionHeaderStyle, welcomeParaStyle} = styles;
    const welcomePara = "Welcome to Football - Who am I?\n" +
        "A football(soccer) trivia guess who style app in which you will be given certain facts about a player and you must guess who is being described.\n" +
        "The quiz is intended to be difficult so do not be too put off if you find yourself stuck on a question, the game works best with a group of friends so that you can solve the questions together.\n" +
        "If you do find yourself stuck, there are a couple of mechanisms to give you a helping hand which include a number of clues, revealing a letter of the answer and an option to share the question to your favourite social media platform.\n";
    const answeringTheQ = "Answering a question";
    const answeringTheQPara = "All questions require you to enter the name of the player being described.\n" +
        "You are only required to enter the player's last name although entering the full name will also be accepted, BUT you MUST spell it correctly.\n";
    const cluesPosPara = "Some of the clues are based around the player's playing position and are broken up into 4 categories: 'Goalkeeper', 'Defender', 'Midfielder' & 'Forward'.\n" +
        "The categories are fairly self explanatory, but the subjective positions are 'wing-backs' and 'wingers' which we categorise as a 'Defender' and a 'Midfielder' respectively. For more information and a definition of each position, please refer to the Association football positions linked below.\n" +
        "Please also be aware that a player can be considered to have more than one position (categories are NOT mutually exclusive). An example could be Wayne Rooney or James Milner, who have played in different positions over the span of their career.";
    const nationalityPosPara = "One of the clues is based around the player's nationality ('I am English?'). This is based on the player in question's place of birth NOT whether they are eligible to play for that country internationally or whether they are an eligible citizen.\n" +
        "So for this clue to be deemed true, the player in question must have been born in England.";
    return (
        <View style={container}>
        <Text style={heading}>How to play...</Text>
        <ScrollView>
            <Text style={welcomeParaStyle}>{welcomePara}</Text>
            <Text style={sectionHeaderStyle}>{answeringTheQ}</Text>
            <Text style={welcomeParaStyle}>{answeringTheQPara}</Text>
            <Text style={sectionHeaderStyle}>Clues - Positions</Text>
            <Text style={welcomeParaStyle}>{cluesPosPara}</Text>
            <Text style={{color: 'blue', fontSize: 13}}
                  onPress={() => Linking.openURL('https://en.wikipedia.org/wiki/Association_football_positions')}>
                https://en.wikipedia.org/wiki/Association_football_positions
            </Text>
            <Text style={sectionHeaderStyle}>Clues - Nationality</Text>
            <Text style={welcomeParaStyle}>{nationalityPosPara}</Text>
            <Text style={sectionHeaderStyle}>Questions valid at date: 03/2018</Text>
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
        margin: 3,
        fontFamily: Fonts.Cabin,
        fontSize: 30,
        fontWeight: 'bold',
        color: '#ffffff'
    },
    sectionHeaderStyle: {
        fontFamily: Fonts.Cabin,
        fontSize: 20,
        fontWeight: 'bold',
        margin: 3
    },
    welcomeParaStyle: {
        fontFamily: Fonts.Cabin,
        fontSize: 15,
        margin: 3
    }
});

export default HowToPlay;