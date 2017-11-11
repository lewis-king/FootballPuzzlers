import React, { Component } from 'react';
import ReactNative, {
    AppRegistry,
    Image,
    StyleSheet,
    Text,
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
import QuestionsDAO from '../services/questions-dao';

export default class MainContainer extends Component {

    constructor(props) {
        super(props);
        this.state = {questions: []};
        this.nextQuestion = this.nextQuestion.bind(this);
    }

    componentWillMount() {
        this.setState({
            questions: baseQuestions,
            question: baseQuestions["0"]});
        QuestionsDAO.preLoadQuestions(baseQuestions);
    }

    nextQuestion = () => {
        this.setState({question: baseQuestions["1"]})
    }

    render() {
        const {container, content, image} = styles;
        return (
            <View style={container}>
            <Image source={BACKGROUND_IMAGE} style={image}>
                <View style={content}>
                <Header />
                <Question question={this.state.question} />
                <AdMobBanner
                    adSize="banner"
                    adUnitID="ca-app-pub-5964830289406172/2390323530"
                    testDevices={'EMULATOR'}
                    onAdFailedToLoad={error => console.error(error)}
                />
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
    }
});