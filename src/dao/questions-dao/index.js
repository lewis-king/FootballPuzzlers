import Realm from 'realm';
import baseQuestions from '../../../config/baseQuestions.json';
import realm from '../realm/schema/realm';

const QuestionDAO = {
    preLoadQuestions: function(questions) {
        QuestionDAO.persistQuestionsToDB(questions);
    },

    persistQuestionsToDB: function(questions) {
        console.log("About to save questions to DB");
        const currQs = realm.objects("Question");
        questions.forEach(((question, i) => {
            realm.write(() => {
                console.log("Saving question with id: " + question.id);
                const {GK, DEF, MID, FWD, RET, ENG} = question.clues;
                console.log("question.clues is: " + question.clues);
                //!!!!STORE THIS AS BOOLEAN NOT STRING, BOOLEAN.VALUEOF
                console.log("GK, DEF, MID, FWD, RET, ENG is " + GK + DEF + MID + FWD + RET + ENG);
                console.log("index is: ", i);
                console.log("Current Questions is: " +currQs);
                const isAnswered = (currQs[i] !== undefined && currQs[i].answered !== undefined
                                                            && currQs[i].answered) || false;
                const selectedClues = {
                        GK: (currQs[i] !== undefined && currQs[i].selectedClues !== null && currQs[i].selectedClues.GK !== '') ? currQs[i].selectedClues.GK : '',
                        DEF: (currQs[i] !== undefined && currQs[i].selectedClues !== null && currQs[i].selectedClues.DEF !== '') ? currQs[i].selectedClues.DEF : '',
                        MID: (currQs[i] !== undefined && currQs[i].selectedClues !== null && currQs[i].selectedClues.MID !== '') ? currQs[i].selectedClues.MID : '',
                        FWD: (currQs[i] !== undefined && currQs[i].selectedClues !== null && currQs[i].selectedClues.FWD !== '') ? currQs[i].selectedClues.FWD : '',
                        RET: (currQs[i] !== undefined && currQs[i].selectedClues !== null && currQs[i].selectedClues.RET !== '') ? currQs[i].selectedClues.RET : '',
                        ENG: (currQs[i] !== undefined && currQs[i].selectedClues !== null && currQs[i].selectedClues.ENG !== '') ? currQs[i].selectedClues.ENG : ''
                    };
                const selectedCluesArr = Object.values(selectedClues);
                console.log("about to save this many selected clues: " +selectedCluesArr.length);

                realm.create('Question',
                    {
                        id: question.id,
                        question: question.question,
                        acceptableAnswers: question.acceptableAnswers.toString(),
                        clues: {GK, DEF, MID, FWD, RET, ENG},
                        answered: isAnswered,
                        selectedClues
                    }, true)
            });
        }));
        console.log("Finished saving questions to the DB");
    },

    updateQuestion: function (id) {
        console.log("Updating question with Id: " + id);
        realm.write(() => {
            realm.create('Question', {id: id, answered: true}, true);
        });
        console.log("Finished writing update that question is answered");
    },

    updateSelectedClues: function (id, selectedClues) {
        realm.write(() => {
            realm.create('Question',
                {
                    id: id,
                    selectedClues: selectedClues
                }, true)
        });
    },

    retrieveAllUnansweredQuestions: function (callback) {
        let questions = realm.objects('Question').filtered('answered == false');
        console.log("Returning total number of unanswered questions from the DB: " + questions.length);
        questions.forEach((e) => {
            console.log("Question Id: " + e.id);
            console.log("Question: " + e.question);
            console.log("Acceptable Answers: " + e.acceptableAnswers);
            console.log("Answered?: " + e.answered);
            const selectedCluesArr = Object.values(e.selectedClues);
            console.log("about to retrieve this many selected clues: " +selectedCluesArr.length);
        });
        callback(questions);
    },

    retrieveAllAnsweredQuestions: function (callback) {
        let questions = realm.objects('Question').filtered('answered == true');
        console.log("Returning total number of answered questions from the DB: " + questions.length);
        callback(questions);
    },

    retrieveAllQuestions: function () {
        let questions = realm.objects('Question');
        console.log("Returning total questions from the DB: " + questions.length);
        return questions;
    },

    purgeDatabase: function (callback) {
        realm.write(() => {
            realm.deleteAll();
        });
        callback(baseQuestions);
    },

    retrieveUserProgress: function() {
        let allQuestionsAmount = realm.objects('Question').length;
        let answeredQuestionsAmount = realm.objects('Question').filtered('answered == true').length;
        return Math.round((answeredQuestionsAmount / allQuestionsAmount) * 100);
    }
};

module.exports = QuestionDAO;
