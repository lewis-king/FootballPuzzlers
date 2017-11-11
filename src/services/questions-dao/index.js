import Realm from 'realm';

const QuestionSchema = {
    name: 'Question',
    primaryKey: 'id',
    properties: {
        id: 'int',
        question: 'string',
        acceptableAnswers: 'string',
        answered: 'bool'
    }
};

const QuestionDAO = {
    preLoadQuestions: function(questions) {
        //First check whether we need to load questions into DB
        const questionsInDB = QuestionDAO.retrieveAllQuestions();
        /*if (questions.length <= questionsInDB.length) {
            console.log("Don't need to preload questions into the DB");
            return null;
        }*/
        console.log("About to save questions to DB");
        QuestionDAO.purgeDatabase();
        Realm.open({schema: [QuestionSchema]})
            .then(realm => {
                questions.forEach((question) => {
                    realm.write(() => {
                        console.log("Saving question with id: " + question.questionId);
                        realm.create('Question',
                            {
                                id: question.questionId,
                                question: question.question,
                                acceptableAnswers: question.acceptableAnswers.toString(),
                                answered: false
                            })
                    });
                });
                console.log("Finished saving questions to the DB");
            });
    },

    updateQuestion: function(id) {
        console.log("Updating question with Id: " +id);
        Realm.open({schema: [QuestionSchema]})
            .then(realm => {
                let singleQuestion = realm.objects('Question').filtered('id == ' +id);
                console.log("Found question with Id: " +singleQuestion);
                realm.write(() => {
                    singleQuestion.answered = true;
                })
                console.log("Finished writing update that question is answered");
            })
    },

    retrieveAllQuestions: function() {
        Realm.open({schema: [QuestionSchema]})
            .then(realm => {
                let questions = realm.objects('Question');
                console.log("Returning total number of questions from the DB: " +questions.length);
                return questions;
            })
    },

    purgeDatabase: function() {
        Realm.open({schema: [QuestionSchema]})
            .then(realm => {
                realm.write(() => {
                    realm.deleteAll();
                });
            });
    }
};

module.exports = QuestionDAO;
