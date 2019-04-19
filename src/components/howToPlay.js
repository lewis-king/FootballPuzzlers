import React from 'React';
import {Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Fonts} from "../utils/fonts";
import Constants from '../utils/constants';
import QuestionsIntegrityDisclaimer from "./questionsIntegrityDisclaimer";
import emailHandler from "../services/email";
import Heading from "./heading";

const HowToPlay = () => {
    const {container, heading, sectionHeaderStyle, welcomeParaStyle} = styles;
    const howToPlayHeader = "How to play?";
    const welcomePara = "A football (soccer) trivia guess who style app, in which you will be given certain facts about a player and must guess who is being described.\n" +
        "The questions are intended to be difficult, so do not be too put off if you find yourself stuck. The game works best with a group of friends so that you can solve the questions together.\n" +
        "If you do find yourself stuck on a question, there are a couple of mechanisms to give you a helping hand. These include a selection of clues and revealing a letter of the answer.\n";
    const answeringTheQ = "Answering a question";
    const answeringTheQPara = "All questions require you to enter the name of the player being described.\n" +
        "You are only required to enter the player's last name, although entering the full name will also be accepted. You MUST spell it correctly.\n";
    const cluesPosPara = "Some of the clues are based around the player's position and are broken up into 4 categories; 'Goalkeeper', 'Defender', 'Midfielder' & 'Forward'.\n" +
        "For the purpose of this app, 'wing-backs' and 'wingers' are categorised as 'Defenders' and 'Midfielders' respectively. For more information and a definition of each position, please refer to the Association football positions linked below.\n" +
        "Please also be aware that a player can be considered to have more than one position (categories are NOT mutually exclusive). An example could be Wayne Rooney or James Milner, who have played in different positions over the course of their career.";
    const nationalityPosPara = "One of the clues is based around the player's nationality ('I am English'). This is based on the player in question's place of birth and NOT whether they are eligible to play for that country internationally or whether they are an eligible citizen.\n" +
        "So for this clue to be deemed true, the player in question must have been born in England.";
    return (
        <View style={container}>
        <Image style={heading} source={require('../resources/images/whoami2x.png')}></Image>
        <ScrollView>
          <Text style={sectionHeaderStyle}>{howToPlayHeader}</Text>
            <Text style={welcomeParaStyle}>{welcomePara}</Text>
            <Text style={sectionHeaderStyle}>{answeringTheQ}</Text>
            <Text style={welcomeParaStyle}>{answeringTheQPara}</Text>
            <Text style={sectionHeaderStyle}>Clues - Positions</Text>
            <Text style={welcomeParaStyle}>{cluesPosPara}</Text>
            <Text style={{color: 'blue', fontSize: 14}}
                  onPress={() => Linking.openURL('https://en.wikipedia.org/wiki/Association_football_positions')}>
                https://en.wikipedia.org/wiki/Association_football_positions
            </Text>
            <Text style={sectionHeaderStyle}>Clues - Nationality</Text>
            <Text style={welcomeParaStyle}>{nationalityPosPara}</Text>
          <QuestionsIntegrityDisclaimer color={"black"}/>
          <TouchableOpacity onPress={emailHandler}>
            <Heading text={"Notice something wrong?"} size={14} alignment={"center"}/>
          </TouchableOpacity>
          <View style={{height: 20}}/>
        </ScrollView>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 5,
        marginBottom: 10
    },
    heading: {
        alignItems: 'center',
        alignSelf: 'center',
        aspectRatio: 1.75,
        marginTop: 0,
        resizeMode: 'contain'
    },
    sectionHeaderStyle: {
        fontFamily: Fonts.Main,
        fontSize: 20,
        fontWeight: 'bold',
        margin: 1,
        color: 'black'
    },
    welcomeParaStyle: {
        fontFamily: Fonts.Main,
        fontSize: 16,
        margin: 1,
        color: 'black'
    }
});

export default HowToPlay;