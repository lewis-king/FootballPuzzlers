import React, { Component } from 'react';
import ReactNative, {
    AppRegistry,
    Image,
    Share,
    StyleSheet,
    Text,
    TouchableHighlight,
    View
} from 'react-native';
import Header from './header';
import Question from './question';
import SubmitAnswer from './submit-answer';
import baseQuestions from '../../config/baseQuestions.json';
import {
    AdMobBanner,
    AdMobInterstitial,
    PublisherBanner,
    AdMobRewarded,
} from 'react-native-admob';
import {BACKGROUND_IMAGE} from '../resources/images';
import QuestionsDAO from '../dao/questions-dao';

export default class QuestionContainer extends Component {

    constructor(props) {
        super(props);
        const {isHistoric} = props.navigation.state.params;
        this.state = {
            questions: [],
            isHistoric,
            counter: 0
        };
        this.nextQuestion = this.nextQuestion.bind(this);
        this.updateState = this.updateState.bind(this);
        if (!isHistoric) {
            QuestionsDAO.preLoadQuestions(baseQuestions);
        }
    }

    componentWillMount() {
        if (this.state.isHistoric) {
            QuestionsDAO.retrieveAllAnsweredQuestions(this.updateState)
        } else {
            QuestionsDAO.retrieveAllUnansweredQuestions(this.updateState);
        }
    }

    updateState(questionsFromDB) {
        this.setState({
            questions: questionsFromDB,
            question: questionsFromDB[this.state.counter]});
    }

    nextQuestion = () => {
        let counter = this.state.counter++;
        this.setState({
            question: this.state.questions[counter],
            counter
        })
    }

    share = () => {
        Share.share({
            message: this.state.question.toString(),
            title: 'I\'m stuck on Football Puzzlers!',
            url: 'http://google.com'
        }, {
            dialogTitle: 'I\'m stuck!',
            excludedActivityTypes: [],
        })
            .then(console.log("shared"))
            .catch(err => console.log(err))
    }

    render() {
        const {container, content, image, qId} = styles;
        return (
            <View style={container}>
                <Image source={BACKGROUND_IMAGE} style={image}>
                    <View style={content}>
                        <View>
                        <Header/>
                            <Text style={qId}>Question: {this.state.question.id}</Text>
                        </View>
                        <Question question={this.state.question}/>
                        <View>
                            <AdMobBanner
                                adSize="banner"
                                adUnitID="ca-app-pub-5964830289406172/2390323530"
                                testDevices={'EMULATOR'}
                                onAdFailedToLoad={error => console.error(error)}
                            />
                            <TouchableHighlight onPress={this.share}>
                                <Text style={styles.shareText}>Share Question</Text>
                            </TouchableHighlight>
                        </View>
                        <SubmitAnswer question={this.state.question} action={this.nextQuestion}/>
                    </View>
                </Image>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.55)'
    },
    image: {
        flex: 1,
        width: null,
        height: null,
        backgroundColor: 'transparent',
        resizeMode: 'stretch',
    },
    shareText: {
        fontSize: 20,
        margin: 10,
        textAlign: 'center',
        alignItems: 'center'
    },
    qId: {
        textAlign: 'center',
        alignItems: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#e2e2e2'
    },
});