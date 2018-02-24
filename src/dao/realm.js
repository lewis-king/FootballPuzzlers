import Realm from 'realm';
import QuestionsDAO from './questions-dao';
import baseQuestions from '../../config/baseQuestions.json';

class Question extends Realm.Object {}
Question.schema = {
    name: 'Question',
    primaryKey: 'id',
    properties: {
        id: 'int',
        question: 'string',
        acceptableAnswers: 'string',
        answered: 'bool',
        clues: 'Clues',
        obtainedClues: 'Clues'
    }
};

class Clues extends Realm.Object {}
Clues.schema = {
    name: 'Clues',
    properties: {
        GK: 'bool',
        DEF: 'bool',
        MID: 'bool',
        FWD: 'bool',
        RET: 'bool',
        ENG: 'bool'
    }
};

export default new Realm({
    schema: [Question, Clues],
    schemaVersion: 1,
    migration: (oldRealm, newRealm) => {
        // only apply this change if upgrading to schemaVersion 1
        if (oldRealm.schemaVersion < 1) {
            const oldObjects = oldRealm.objects('Question');
            const newObjects = newRealm.objects('Question');
            for (let i = 0; i < oldObjects.length; i++) {
                newObjects[i].id = oldObjects[i].id;
                newObjects[i].answered = oldObjects[i].answered;
            }
        }
    }
});