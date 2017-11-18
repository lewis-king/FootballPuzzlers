import React, {Component} from 'react';
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
} from 'react-native-admob';
import {BACKGROUND_IMAGE, SHARE_IMAGE} from '../resources/images';
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
        if (AdMobInterstitial.getAdUnitId)
        AdMobInterstitial.setAdUnitID('ca-app-pub-5964830289406172/2390323530');
        this.nextQuestion = this.nextQuestion.bind(this);
        this.updateState = this.updateState.bind(this);
    }

    componentWillMount() {

        AdMobInterstitial.addEventListener('adLoaded',
            () => console.log('AdMobInterstitial adLoaded')
        );
        AdMobInterstitial.addEventListener('adFailedToLoad',
            (error) => console.warn(error)
        );
        AdMobInterstitial.addEventListener('adOpened',
            () => console.log('AdMobInterstitial => adOpened')
        );
        AdMobInterstitial.addEventListener('adClosed',
            () => {
                console.log('AdMobInterstitial => adClosed');
                AdMobInterstitial.requestAd().catch(error => console.warn(error));
            }
        );
        AdMobInterstitial.addEventListener('adLeftApplication',
            () => console.log('AdMobInterstitial => adLeftApplication')
        );

        //AdMobInterstitial.requestAd().catch(error => console.warn(error));

        if (this.state.isHistoric) {
            QuestionsDAO.retrieveAllAnsweredQuestions(this.updateState)
        } else {
            QuestionsDAO.retrieveAllUnansweredQuestions(this.updateState);
        }
    }

    componentWillUnmount() {
        AdMobInterstitial.removeAllListeners();
    }

    updateState(questionsFromDB) {
        this.setState({
            questions: questionsFromDB,
            question: questionsFromDB[this.state.counter]
        });
    }

    showInterstitial() {
        //Let's show the interstitial every 3 questions
        if (this.state.counter % 3 === 0) {
            AdMobInterstitial.requestAd(AdMobInterstitial.showAd);
        }
    }

    nextQuestion = () => {
        if (this.state.counter === this.state.questions.length - 1) {
            console.log("I want to navigate...");
            if(this.state.isHistoric) {
                console.log("Back to mainmenu");
                this.props.navigation.navigate('MainMenu');
            } else {
                console.log("to completed");
                this.props.navigation.navigate('Completed');
            }
        } else {
            let counter = ++this.state.counter;
            this.showInterstitial();
            this.setState({
                question: this.state.questions[counter],
                counter
            })
        }
    }

    share = () => {
        Share.share({
            message: this.state.question.toString(),
            title: 'I\'m stuck on Football Puzzlers!',
            url: ''
        }, {
            dialogTitle: 'I\'m stuck!',
            excludedActivityTypes: [],
        })
            .then(console.log("shared"))
            .catch(err => console.log(err))
    }

    render() {
        const {container, content, image, shareImg, shareView, qId} = styles;
        if (this.state.questions.length === 0) {
            return null;
        }
        return (
            <View style={container}>
                <Image source={BACKGROUND_IMAGE} style={image}>
                    <View style={content}>
                        <View>
                            <Header text={'Football Puzzlers'}/>
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
                            <View style={shareView}>
                                <TouchableHighlight onPress={this.share} activeOpacity={0.8} underlayColor={'#fffdfe'}>
                                    <Image source={SHARE_IMAGE} style={shareImg}/>
                                </TouchableHighlight>
                            </View>
                        </View>
                        <SubmitAnswer question={this.state.question} action={this.nextQuestion}
                                      submitBtnTxt={this.state.isHistoric ? 'Next' : 'Submit'}
                                      isHistoric={this.state.isHistoric}/>
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
    shareView: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    },
    shareImg: {
        height: 50,
        width: 50,
    },
    qId: {
        textAlign: 'center',
        alignItems: 'center',
        fontFamily: 'cabin',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#e2e2e2'
    },
});