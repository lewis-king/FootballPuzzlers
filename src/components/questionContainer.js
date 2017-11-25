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
import {SHARE_IMAGE} from '../resources/images';
import QuestionsDAO from '../dao/questions-dao';
import LinearGradient from 'react-native-linear-gradient';
import {Colours} from '../utils/colours';

AdMobInterstitial.setAdUnitID('ca-app-pub-5964830289406172/2390323530');

export default class QuestionContainer extends Component {

    constructor(props) {
        super(props);
        const {isHistoric} = props.navigation.state.params;
        this.state = {
            questions: [],
            isHistoric
        };
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
            question: questionsFromDB[0]
        }, this.goToCompleted);
    }

    goToCompleted() {
        if (this.state.questions.length === 0) {
            this.props.navigation.navigate('Completed');
        }
    }

    showInterstitial() {
        //Let's show the interstitial every 3 questions
        if (this.state.question.id % 3 === 0) {
            AdMobInterstitial.requestAd(AdMobInterstitial.showAd);
        }
    }

    nextQuestion = () => {
        if (this.state.question.id === this.state.questions.length - 1) {
            console.log("I want to navigate...");
            if (this.state.isHistoric) {
                console.log("Back to mainmenu");
                this.props.navigation.navigate('MainMenu');
            } else {
                console.log("to completed");
                this.props.navigation.navigate('Completed');
            }
        } else {
            this.showInterstitial();
            //Questions are reloaded from DB on next question which means index to grab active
            //question should always be 0
            const index = this.state.isHistoric ? this.state.question.id : 0;
            this.setState({
                question: this.state.questions[index],
            });
            console.log("set state in next question");
        }
    }

    share = () => {
        Share.share({
            message: 'Football - Who am I? - ' + this.state.question.question,
            title: 'I\'m stuck on Football - Who am I?!',
            url: ''
        }, {
            dialogTitle: 'I\'m stuck on Football - Who am I?!',
            excludedActivityTypes: [],
        })
            .then(console.log("shared"))
            .catch(err => console.log(err))
    }

    render() {
        console.log("I'm rendering");
        const {container, content, gradient, shareImg, shareView, qId} = styles;
        if (this.state.questions.length === 0) {
            return null;
        }
        const rand = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
        return (
            <View style={container}>
                <LinearGradient start={{x: 0.0, y: 0.25}} end={{x: 0.5, y: 1.0}}
                                locations={[0, 0.5, 0.6]}
                                colors={Colours[rand]}
                                style={gradient}>
                    <View style={content}>
                        <View>
                            <Header text={'Football - Who am I?'}/>
                            <Text style={qId}>Question: {this.state.question.id}</Text>
                        </View>
                        <View>
                            <Question question={this.state.question}/>
                            <View style={shareView}>
                                <TouchableHighlight onPress={this.share} activeOpacity={0.8} underlayColor={'#fffdfe'}>
                                    <Image source={SHARE_IMAGE} style={shareImg}/>
                                </TouchableHighlight>
                            </View>
                        </View>
                        <View>
                            <AdMobBanner
                                adSize="banner"
                                adUnitID="ca-app-pub-5964830289406172/2390323530"
                                testDevices={'EMULATOR'}
                                onAdFailedToLoad={error => console.error(error)}
                            />
                        </View>
                        <SubmitAnswer question={this.state.question} action={this.nextQuestion}
                                      submitBtnTxt={this.state.isHistoric ? 'Next' : 'Submit'}
                                      isHistoric={this.state.isHistoric}/>
                    </View>
                </LinearGradient>
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
    gradient: {
        flex: 1,
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
        color: '#3d3d3d'
    },
});