import React, {Component} from 'react';
import ReactNative, {
    Alert,
    Animated,
    Dimensions,
    FlatList,
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
import Modal from "react-native-modal";
import Question from './question';
import SubmitAnswer from './submit-answer';
import {
    AdMobBanner,
    AdMobInterstitial,
    AdMobRewarded
} from 'react-native-admob';
import {Fonts} from '../utils/fonts';
import {SHARE_IMAGE} from '../resources/images';
import QuestionsDAO from '../dao/questions-dao';
import {Colours} from '../utils/colours';
import {Constants} from '../utils/constants';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import Overlay from 'react-native-modal-overlay';
import {connect} from 'react-redux';
import Theme from '../services/theme';
import * as Animatable from "react-native-animatable";
import Categories from "../services/category";

//real Android AdUnitID banner ca-app-pub-5964830289406172/2390323530
//real Android AdUnitID interstitial ca-app-pub-5964830289406172/1517036977
//real Android AdUnitID reward ca-app-pub-5964830289406172/2139718423
//real iOS AdUnitID banner ca-app-pub-5964830289406172/9312671442
//real iOS AdUnitID interstitial ca-app-pub-5964830289406172/6822239473
//real iOS AdUnitID reward ca-app-pub-5964830289406172/1062440473
//test banner ca-app-pub-3940256099942544/2934735716
//test const interstitialId = "ca-app-pub-3940256099942544/4411468910";
//test const rewardedId = "ca-app-pub-3940256099942544/5224354917";
//banner test const bannerId = "ca-app-pub-3940256099942544/2934735716";

const interstitialId = Platform.OS === 'ios' ? 'ca-app-pub-5964830289406172/6822239473' : 'ca-app-pub-5964830289406172/1517036977';
const bannerId = Platform.OS === 'ios' ? 'ca-app-pub-5964830289406172/9312671442' : 'ca-app-pub-5964830289406172/2390323530';
const rewardedId = Platform.OS === 'ios' ? 'ca-app-pub-5964830289406172/1062440473' : 'ca-app-pub-5964830289406172/2139718423';

AdMobInterstitial.setAdUnitID(interstitialId);
AdMobRewarded.setAdUnitID(rewardedId);

export default class QuestionContainer extends Component {

  static navigationOptions = ({navigation}) => {
    const {category, question} = navigation.state.params;
    const title = 'Question ' + question.questionId;
    const backgroundColor = '#0E1B2F';
    const headerTintColor = Theme[category].main;
    return {
      title,
      headerStyle: {
        backgroundColor,
        borderBottomWidth: 0
      },
      headerTitleStyle: {
        fontFamily: Fonts.Main,
        fontWeight: 'bold'
      },
      headerTintColor: headerTintColor
    }
  };

  constructor(props) {
        super(props);
        const {question, category, isHistoric, refreshProgress, refreshQuestionSelectorProgress} = props.navigation.state.params;
        const rand = this.randNum();
        this.state = {
            question,
            selectedClues: question.selectedClues,
            category,
            isHistoric,
            givenAnswer: '',
            revealLetterBtnDisabled: false,
            revealBtnBackColour: 'rgba(34, 92, 105, 1)',
            modalVisible: false,
            clues: Constants.clues,
            rand,
            refreshProgress,
            refreshQuestionSelectorProgress,
            clueBtnPressAnimation: ''
        };
        this.nextQuestion = this.nextQuestion.bind(this);
        this.updateState = this.updateState.bind(this);
    }

    componentDidMount() {
        console.log("component did mount");
        AdMobInterstitial.addEventListener('adLoaded',
            () => console.log('AdMobInterstitial adLoaded')
        );
        AdMobInterstitial.addEventListener('adFailedToLoad',
            (error) => console.log(error)
        );
        AdMobInterstitial.addEventListener('adOpened',
            () => console.log('AdMobInterstitial => adOpened')
        );
        AdMobInterstitial.addEventListener('adClosed',
            () => {
                console.log('AdMobInterstitial => adClosed');
                AdMobInterstitial.requestAd().catch(error => console.log(error));
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
                console.log(error);
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
                AdMobRewarded.requestAd().catch(error => console.log(error));
                this.resetRevealLetterBtn();
            }
        );
        AdMobRewarded.addEventListener('adLeftApplication',
            () => console.log('AdMobRewarded => adLeftApplication')
        );

        AdMobInterstitial.requestAd();
        AdMobRewarded.requestAd();
        if (this.state.isHistoric) {
        } else {
        }
    }

    componentWillUnmount() {
        AdMobInterstitial.removeAllListeners();
        AdMobRewarded.removeAllListeners();
    }

    randNum(from, to) {
        return Math.floor(Math.random() * (9 - 0 + 1)) + 0;
    }

    updateState(question) {
        let clueCount = 0;
        let selectedClues = {};
        if (question.length !== 0) {
            selectedClues = question.selectedClues;
            clueCount = this.calculateClueCount(question.selectedClues);
        }
        this.setState({
            selectedClues,
            clueCount
        }, this.goToCompleted);
    }

    goToCompleted() {
      this.props.navigation.goBack(null);
    }

    showInterstitial() {
        //Let's show the interstitial every 3 questions
        if (this.state.question.questionId % 3 === 0) {
            AdMobInterstitial.showAd().catch(error => console.log(error));
            AdMobInterstitial.requestAd().catch(error => console.log(error));
        }
    }

    nextQuestion = () => {
      if (!this.state.isHistoric) {
        this.showInterstitial();
      }
      this.props.navigation.goBack(null);
      this.state.refreshQuestionSelectorProgress();
      this.state.refreshProgress();
      this.props.navigation.goBack();
    };

    calculateClueCount = (selectedClues) => {
        let clueCount = 0;
        Object.keys(selectedClues).map(function(keyName, keyIndex){
            let selected = selectedClues[keyName];
            if (selected !== "") {
                clueCount++
            }
        });
        return clueCount;
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
            this.resetRevealLetterBtn();
        });
    };

    showRevealLetterAlert = () => {
        this.setState({
            revealLetterBtnDisabled: true,
            revealBtnBackColour: '#5f7d84'
        }, () => {
            Alert.alert(
                'Reveal Letter',
                'If you watch the following advert, the first letter of the player\'s last name will be revealed (requires data)',
                [
                    {text: 'No thanks', onPress: () => {
                        console.log('Cancel Pressed');
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
        console.log("clueId selected is: " + clueId);
        if (this.calculateClueCount(this.state.selectedClues) < 2) {
          //check if clue is yes or no...
          const clueAnswer = this.state.question.clues[clueId] ? "True" : "False";
          console.log("clue answer is: " + clueAnswer);
          this.setState(prevState => ({
            selectedClues: {
              ...prevState.selectedClues,
              [clueId]: clueAnswer
            },
          }), () => {
            const newClueCount = this.calculateClueCount(this.state.selectedClues);
            this.setState({
              clueCount: newClueCount
            });
            QuestionsDAO.updateSelectedClues(this.state.question.id, this.state.selectedClues);
          });
          console.log("selected clues: " + this.state.selectedClues[clueId]);
        } else {
          this.setState({
            clueBtnPressAnimation: 'shake'
          })
        }
    };

    determineClueRevealBackgroundCol = (clueRevealState) => {
        const result = (clueRevealState === undefined || clueRevealState === '')
            ? 'white' : clueRevealState == 'True' ? 'rgba(35, 237, 113, 1)' : 'rgba(225, 49, 49, 1)';
        return result;
    };

    render() {
        console.log("I'm rendering");
        const {adBanner, cluesBtn, cluesBtnContent, clueElements, cluesHeaderTxt, cluesList, cluesOverlay, closeCluesOverlay, cluesTitle, cluesTxt, cluesQuestionContext, container, content, gradient,
            headerText, shareImg, cluesRow, shareView, qId, revealBtn, revealBtnTxt, clueRevealBtn} = styles;
        if (this.state.question == null) {
            return null;
        }
        const AnimatableTouchableHighlight = Animatable.createAnimatableComponent(TouchableHighlight);
        const revealLetterCopy = 'Reveal a Letter';
        const cluesCopy = 'View 2 Clues';
        const AnimatedButton = Animated.createAnimatedComponent(TouchableOpacity);
        const deviceWidth = Dimensions.get("window").width;
        const deviceHeight = Platform.OS === "ios"
          ? Dimensions.get("window").height
          : require("react-native-extra-dimensions-android").get("REAL_WINDOW_HEIGHT");

        const questionId = (Platform.OS === 'ios') ? <Text style={headerText}/> : (<Text style={[headerText, {color: Theme[this.state.category].main}]}>{"Question " + this.state.question.questionId}</Text>);

        return (
          <View style={container}>
            <Modal isVisible={this.state.modalVisible} deviceWidth={deviceWidth}
                   deviceHeight={deviceHeight} animationIn="slideInUp">
              <View style={[cluesOverlay, {backgroundColor: Theme[this.state.category].main}]}>
                <TouchableHighlight onPress={this.hideCluesOverlay}>
                  <Text style={closeCluesOverlay}>X</Text>
                </TouchableHighlight>
                <Text style={cluesTitle}>
                  Two of the clues below are linked to the player. Tap below to reveal.
                </Text>
                <Text style={cluesQuestionContext}>{this.state.question.question}</Text>
                <View style={{justifyContent: 'space-between'}}>
                  <ScrollView style={cluesList}>
                    <FlatList data={this.state.clues} extraData={this.state}
                              renderItem={({item}) =>
                                <AnimatableTouchableHighlight
                                  animation={this.state.clueBtnPressAnimation}
                                  style={[cluesBtn, {
                                    backgroundColor:
                                      this.determineClueRevealBackgroundCol(this.state.selectedClues[item.key])
                                  }]}
                                  onPress={() => this.chooseClue(item.key)}
                                  disabled={this.state.isHistoric}>
                                  <View style={[cluesBtnContent]}>
                                    <Text style={cluesTxt}>{item.desc}</Text>
                                  </View>
                                </AnimatableTouchableHighlight>
                              }>
                    </FlatList>
                  </ScrollView>
                </View>
              </View>
            </Modal>
                    <View style={content}>
                      {questionId}
                      <View>
                            <ScrollView>
                                <Question question={this.state.question}/>
                            </ScrollView>
                            <View style={shareView}>
                                <View style={cluesRow}>
                                    <AnimatedButton onPress={this.showCluesOverlay}
                                                    style={[revealBtn, {backgroundColor: Theme[this.state.category].main}]}
                                                    disabled={false}>
                                        <Text style={revealBtnTxt}>{cluesCopy}</Text>
                                    </AnimatedButton>
                                    <AnimatedButton onPress={this.showRevealLetterAlert}
                                                    style={[revealBtn, {backgroundColor: Theme[this.state.category].main}]}
                                                    disabled={this.state.revealLetterBtnDisabled}>
                                        <Text style={revealBtnTxt}>{revealLetterCopy}</Text>
                                    </AnimatedButton>
                                </View>
                            </View>
                        </View>
                        <View style={adBanner}>
                            <AdMobBanner
                                adSize="smartBannerPortrait"
                                adUnitID={bannerId}
                                onAdFailedToLoad={(error) => console.log(error)}
                            />
                        </View>
                        <SubmitAnswer question={this.state.question} category={this.state.category} action={this.nextQuestion}
                                      submitBtnTxt={this.state.isHistoric ? 'Back' : 'Submit'}
                                      isHistoric={this.state.isHistoric} givenAnswer={this.state.givenAnswer}/>
                    </View>
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
        alignItems: 'stretch',
        height: 70,
        justifyContent: 'center',
        flexDirection: 'column',
        flex: 1,
        backgroundColor: 'white',
        borderColor: 'rgba(0, 0, 0, 0)',
        borderRadius: 5,
        borderWidth: 1,
        marginRight: 20,
        marginLeft: 20,
        marginBottom: 10
    },
    cluesBtnContent: {
      flexDirection: 'column'
    },
    clueElements: {
        flex: 1,
        flexDirection: 'row',
        margin: 5
    },
    cluesHeaderTxt: {
      fontFamily: Fonts.Main,
      fontWeight: 'bold',
      fontSize: 20
    },
    cluesList: {
      flexDirection: 'column',
    },
    clueRevealBtn: {
        width: 50,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderWidth: 1,
        margin: 7
    },
    cluesOverlay: {
      marginTop: 20,
      borderTopLeftRadius: 55,
      borderTopRightRadius: 55,
      flexDirection: 'column',
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: 'rgba(108, 74, 248, 1)'
    },
    closeCluesOverlay: {
      alignSelf: 'flex-end',
      color: 'white',
      fontSize: 32,
      marginRight: 30,
      marginTop: 10
    },
    cluesTitle: {
      color: 'white',
      fontSize: 20,
      textAlign: 'center',
      marginBottom: 10
    },
    cluesRow: {
      justifyContent: 'space-between',
      flexDirection: 'row'
    },
    cluesTxt: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: Fonts.Main,
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black'
    },
    cluesQuestionContext: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 10,
      color: 'rgba(255, 255, 255, 0.5)'
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: '#0E1B2F'
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: '#0E1B2F'
    },
    headerText: {
        color: 'white',
        textAlign: 'center',
        fontFamily: Fonts.Main,
        fontWeight: 'bold',
        fontSize: 16,
        paddingTop: 10,
        paddingBottom: 10
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
        alignSelf: 'stretch',
        textAlign: 'right',
        fontFamily: Fonts.Main,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#575757'
    },
    revealBtn: {
        backgroundColor: 'rgba(108, 74, 248, 1)',
        borderRadius: 5,
        borderWidth: 1,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 5,
        paddingBottom: 5,
        paddingRight: 8,
        paddingLeft: 8,
        marginLeft: 10,
        marginRight: 10,
        height: 50,
        width: 150
    },
    revealBtnTxt: {
        alignSelf: 'center',
        color: '#FFFFFF',
        fontFamily: Fonts.Main,
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center'
    }
});