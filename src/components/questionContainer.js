import React, {Component} from 'react';
import ReactNative, {
    Alert,
    Animated,
    FlatList,
    Image,
    Share,
    StyleSheet,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import Header from './header';
import Question from './question';
import SubmitAnswer from './submit-answer';
import {
    AdMobBanner,
    AdMobInterstitial,
    AdMobRewarded
} from 'react-native-admob';
import {SHARE_IMAGE} from '../resources/images';
import QuestionsDAO from '../dao/questions-dao';
import LinearGradient from 'react-native-linear-gradient';
import {Colours} from '../utils/colours';
import {Constants} from '../utils/constants';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import Overlay from 'react-native-modal-overlay';

//real Android AdUnitID banner ca-app-pub-5964830289406172/2390323530
//real Android AdUnitID interstitial ca-app-pub-5964830289406172/1517036977
//real Android AdUnitID reward ca-app-pub-5964830289406172/2139718423
//real iOS AdUnitID banner ca-app-pub-5964830289406172/9312671442
//real iOS AdUnitID interstitial ca-app-pub-5964830289406172/6822239473
//real iOS AdUnitID reward ca-app-pub-5964830289406172/1062440473
//test banner ca-app-pub-3940256099942544/2934735716
//test interstitial ca-app-pub-3940256099942544/4411468910'

const interstitialId = Platform.OS === 'ios' ? 'ca-app-pub-5964830289406172/6822239473' : 'ca-app-pub-5964830289406172/1517036977';
//const bannerId = Platform.OS === 'ios' ? 'ca-app-pub-5964830289406172/9312671442' : 'ca-app-pub-5964830289406172/2390323530';
const rewardedId = Platform.OS === 'ios' ? 'ca-app-pub-5964830289406172/1062440473' : 'ca-app-pub-5964830289406172/2139718423';
const bannerId = "ca-app-pub-3940256099942544/2934735716";

AdMobInterstitial.setAdUnitID(interstitialId);
AdMobRewarded.setAdUnitID(rewardedId);

export default class QuestionContainer extends Component {

    constructor(props) {
        super(props);
        const {isHistoric, refreshProgress} = props.navigation.state.params;
        this.state = {
            questions: [],
            isHistoric,
            refreshProgress,
            givenAnswer: '',
            revealLetterBtnDisabled: false,
            revealBtnBackColour: 'rgba(34, 92, 105, 1)',
            modalVisible: false,
            clues: Constants.clues,
            selectedClues: {},
            clueCount: 0
        };
        this.nextQuestion = this.nextQuestion.bind(this);
        this.updateState = this.updateState.bind(this);
    }

    componentDidMount() {

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

        AdMobRewarded.addEventListener('rewarded',
            (reward) => {
                console.log('AdMobRewarded => rewarded', reward);
                this.setState({
                    revealLetterBtnDisabled: true,
                    revealBtnBackColour: '#5f7d84'
                });
                this.revealLetterOfAnswer();
            }
        );
        AdMobRewarded.addEventListener('adLoaded',
            () => {
            console.log('AdMobRewarded => adLoaded');
            this.resetRevealLetterBtn();
        }
        );
        AdMobRewarded.addEventListener('adFailedToLoad',
            (error) => {
                console.warn(error);
                this.resetRevealLetterBtn();
            }
        );
        AdMobRewarded.addEventListener('adOpened',
            () => {
                console.log('AdMobRewarded => adOpened');
                this.resetRevealLetterBtn();
            }
        );
        AdMobRewarded.addEventListener('videoStarted',
            () => {
                console.log('AdMobRewarded => videoStarted');
                this.resetRevealLetterBtn();
            }
        );
        AdMobRewarded.addEventListener('adClosed',
            () => {
                console.log('AdMobRewarded => adClosed');
                AdMobRewarded.requestAd().catch(error => console.warn(error));
                this.resetRevealLetterBtn();
            }
        );
        AdMobRewarded.addEventListener('adLeftApplication',
            () => console.log('AdMobRewarded => adLeftApplication')
        );

        AdMobInterstitial.requestAd();
        AdMobRewarded.requestAd();

        if (this.state.isHistoric) {
            QuestionsDAO.retrieveAllAnsweredQuestions(this.updateState)
        } else {
            QuestionsDAO.retrieveAllUnansweredQuestions(this.updateState);
        }
    }

    componentWillUnmount() {
        AdMobInterstitial.removeAllListeners();
        AdMobRewarded.removeAllListeners();
    }

    updateState(questionsFromDB) {
        this.setState({
            questions: questionsFromDB,
            question: questionsFromDB[0],
        }, this.goToCompleted);
    }

    goToCompleted() {
        if (this.state.questions.length === 0) {
            if (this.state.isHistoric) {
                this.props.navigation.navigate('Completed', {title: "",
                    paragraph: Constants.nothingToSeeHere});
            } else {
                this.props.navigation.navigate('Completed', {title: Constants.congratsTitle,
                    paragraph: Constants.congratsParagraph});
            }
        }
    }

    showInterstitial() {
        //Let's show the interstitial every 3 questions
        if (this.state.question.id % 3 === 0) {
            AdMobInterstitial.showAd().catch(error => console.warn(error));
            AdMobInterstitial.requestAd().catch(error => console.warn(error));
        }
    }

    nextQuestion = () => {
        console.log("question id is: " +this.state.question.id);
        console.log("questions length is: " +this.state.questions.length);
        //TODO: Really need to simplify the if condition below!!
        if (((this.state.isHistoric && this.state.question.id === this.state.questions.length)
                || (!this.state.isHistoric && this.state.question.id === Constants.questionsTotal))
                || this.state.questions.length === 0) {
            console.log("I want to navigate...");
            if (this.state.isHistoric) {
                console.log("Back to mainmenu");
                this.props.navigation.navigate('MainMenu');
            } else {
                console.log("to completed");
                this.props.navigation.navigate('Completed', {title: Constants.congratsTitle,
                    paragraph: Constants.congratsParagraph});
            }
        } else {
            this.showInterstitial();
            //Questions are reloaded from DB on next question which means index to grab active
            //question should always be 0
            const index = this.state.isHistoric ? this.state.question.id : 0;
            this.setState({
                question: this.state.questions[index],
                selectedClues: {},
                clueCount: 0
            });
            console.log("set state in next question");
            this.state.refreshProgress()
        }
    };

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
    };

    showRewardedAd = () => {
        this.setState({
            revealLetterBtnDisabled: true,
            revealBtnBackColour: '#5f7d84'
        });
        AdMobRewarded.showAd().catch(error => {

        });
    };

    showRevealLetterAlert = () => {
        this.setState({
            revealLetterBtnDisabled: true,
            revealBtnBackColour: '#5f7d84'
        }, () => {
            Alert.alert(
                'Reveal Letter',
                'If you watch the following Ad, the first letter of the player\'s last name will be revealed',
                [
                    {text: 'No thanks', onPress: () => {
                        console.log('Cancel Pressed');
                        //AdMobRewarded.requestAd().catch(error => console.warn(error));
                        this.resetRevealLetterBtn()}, style: 'cancel'},
                    {text: 'Let\'s do it!', onPress: () => this.showRewardedAd()},
                ],
                { cancelable: false }
            )
        });
    };

    resetRevealLetterBtn = () => {
        this.setState({
            revealLetterBtnDisabled: false,
            revealBtnBackColour: 'rgba(34, 92, 105, 1)'
        });
    };

    revealLetterOfAnswer = () => {
        const fullNameAnswer = this.state.question.acceptableAnswers.split(",")["0"];
        const names = fullNameAnswer.split(" ");
        const namesLen = names.length;
        const firstName = names["0"];
        const lastName = names[namesLen-1];
        const hasOnlyOneName = firstName === lastName; //This is broken if the guy has the same first and last name.. Neville Neville :)

        const lastNameFirstChar = lastName.charAt(0);
        console.log("first name: " +firstName);
        console.log("last name: " +lastName);
        console.log("first char last name: " +lastNameFirstChar);

        this.setState({
            revealLetterBtnDisabled: false,
            revealBtnBackColour: 'rgba(34, 92, 105, 1)',
            givenAnswer: lastNameFirstChar
        })
    };

    showCluesOverlay = () => {
      this.setState({
          modalVisible: true
      })
    };

    hideCluesOverlay = () => {
        this.setState({
            modalVisible: false
        });
    };

    chooseClue = (clueId) => {
        //ux of button checking...
        console.log("clueId selected is: " +clueId);
        //check if clue is yes or no...
        const clueAnswer = this.state.question.clues[clueId] ? "True" : "False";
        console.log("clue answer is: " +clueAnswer);
        const newClueCount = ++this.state.clueCount;
        this.setState(prevState => ({
            selectedClues: {
                ...prevState.selectedClues,
                [clueId]: clueAnswer
            },
            clueCount: newClueCount
        }));
        console.log("selected clues: " +this.state.selectedClues[clueId]);
    };

    determineClueRevealBackgroundCol = (clueRevealState) => {
        const result = clueRevealState === undefined ? 'rgba(52, 52, 52, 0.0)' : clueRevealState == 'True' ? '#137F16' : '#922C30';
        return result;
    };

    render() {
        console.log("I'm rendering");
        const {adBanner, cluesBtn, clueElements, cluesHeaderTxt, cluesList, cluesTxt, container, content, gradient, header,
            headerQId, shareImg, shareRow, shareView, qId, revealBtn, revealBtnTxt, clueRevealBtn} = styles;
        if (this.state.questions.length === 0) {
            return null;
        }
        const rand = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
        const revealLetterCopy = 'Reveal\nLetter';
        const cluesCopy = 'Choose\nClue';
        const AnimatedButton = Animated.createAnimatedComponent(TouchableOpacity);
        return (
            <View style={container}>
                <LinearGradient start={{x: 0.0, y: 0.25}} end={{x: 0.5, y: 1.0}}
                                locations={[0, 0.5, 0.6]}
                                colors={Colours[rand]}
                                style={gradient}>
                    <View style={content}>
                        <View style={header}>
                            <View>
                            <Header text={Constants.title}/>
                            </View>
                            <View style={headerQId}>
                                <Text style={qId}>Q{this.state.question.id}</Text>
                            </View>
                        </View>
                        <View>
                            <Overlay visible={this.state.modalVisible} closeOnTouchOutside animationType="bounceInDown"
                                     containerStyle={{backgroundColor: 'rgba(95, 125, 132, 0.78)'}}
                                     childrenWrapperStyle={{backgroundColor: '#eee'}} onClose={this.hideCluesOverlay} >
                                <Text style={cluesHeaderTxt}>Choose a Clue or Two</Text>
                                <View style={{borderBottomWidth: 1, width: 100, paddingTop: 10}}></View>
                                <FlatList
                                    style={cluesList}
                                    data={this.state.clues}
                                    extraData={this.state}
                                    renderItem={({item}) =>
                                        <View>
                                            <View style={clueElements}>
                                                <AnimatedButton
                                                    disabled={this.state.clueCount >= 2}
                                                    onPress={() => this.chooseClue(item.key)}
                                                    style={[cluesBtn, {backgroundColor: this.state.revealBtnBackColour}]}>
                                                    <Text style={cluesTxt}>{item.desc}</Text>
                                                </AnimatedButton>
                                                <AnimatedButton
                                                    disabled={true}
                                                    style={[clueRevealBtn, {backgroundColor:
                                                        this.determineClueRevealBackgroundCol(this.state.selectedClues[item.key])}]}>
                                                    <Text style={cluesTxt}>{this.state.selectedClues[item.key] !== undefined
                                                        ? this.state.selectedClues[item.key].toString() : "?"}
                                                    </Text>
                                                </AnimatedButton>
                                            </View>
                                        </View>
                                    }
                                />
                                <Text>{this.state.clueCount >= 2 ? "Clue limit reached for this question" : ""}</Text>
                            </Overlay>
                            <ScrollView>
                                <Question question={this.state.question}/>
                            </ScrollView>
                            <View style={shareView}>
                                <View style={shareRow}>
                                    <AnimatedButton onPress={this.showCluesOverlay}
                                                    style={[revealBtn, {backgroundColor: this.state.revealBtnBackColour}]}
                                                    disabled={false}>
                                        <Text style={revealBtnTxt}>{cluesCopy}</Text>
                                    </AnimatedButton>
                                    <TouchableHighlight onPress={this.share} activeOpacity={0.8} underlayColor={'#fffdfe'}>
                                    <Image source={SHARE_IMAGE} style={shareImg}/>
                                    </TouchableHighlight>
                                    <AnimatedButton onPress={this.showRevealLetterAlert}
                                                    style={[revealBtn, {backgroundColor: this.state.revealBtnBackColour}]}
                                                    disabled={this.state.revealLetterBtnDisabled}>
                                        <Text style={revealBtnTxt}>{revealLetterCopy}</Text>
                                    </AnimatedButton>
                                </View>
                            </View>
                        </View>
                        <View style={adBanner}>
                            <AdMobBanner
                                adSize="banner"
                                adUnitID={bannerId}
                                onAdFailedToLoad={error => console.warn(error)}
                            />
                        </View>
                        <SubmitAnswer question={this.state.question} action={this.nextQuestion}
                                      submitBtnTxt={this.state.isHistoric ? 'Next' : 'Submit'}
                                      isHistoric={this.state.isHistoric} givenAnswer={this.state.givenAnswer}/>
                    </View>
                </LinearGradient>
                {/*//TODO: Add conditional logic as KeyboardSpacer is only needed for iOS.*/}
                <KeyboardSpacer/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    adBanner: {
        justifyContent: 'center',
        alignContent: 'stretch',
        alignItems: 'center',
        flexDirection: 'row'
    },
    cluesBtn: {
        alignSelf: 'center',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#2f8492',
        paddingTop: 5,
        paddingBottom: 10,
        paddingRight: 10,
        paddingLeft: 10,
        width: 220,
        height: 35
    },
    clueElements: {
        flex: 1,
        flexDirection: 'row',
        margin: 5
    },
    cluesHeaderTxt: {
      fontFamily: 'cabin',
      fontWeight: 'bold',
      fontSize: 20
    },
    cluesList: {
      padding: 5
    },
    clueRevealBtn: {
        width: 50,
        height: 35,
        alignSelf: 'center',
        borderRadius: 5,
        borderWidth: 1,
        paddingTop: 5,
        paddingBottom: 5,
        paddingRight: 5,
        paddingLeft: 5,
        margin: 7
    },
    cluesTxt: {
        fontFamily: 'cabin',
        fontSize: 16,
        color: '#fffdfe'
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.55)'
    },
    header: {
        alignContent: 'space-between',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    headerQId: {
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        alignSelf: 'flex-end',
        marginTop: -5,
        position: 'absolute',
        right: 5,
        top: 5,
    },
    gradient: {
        flex: 1,
    },
    shareRow: {
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row'
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
        alignSelf: 'stretch',
        textAlign: 'right',
        fontFamily: 'cabin',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#575757'
    },
    revealBtn: {
        alignSelf: 'center',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#2f8492',
        paddingTop: 5,
        paddingBottom: 5,
        paddingRight: 8,
        paddingLeft: 8,
        width: 60,
        height: 40
    },
    revealBtnTxt: {
        alignSelf: 'center',
        color: '#fffdfe',
        fontFamily: 'cabin',
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center'
    }
});