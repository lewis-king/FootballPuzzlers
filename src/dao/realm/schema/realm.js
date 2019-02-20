import Realm from 'realm';

class Question extends Realm.Object {}
Question.schema = {
    name: 'Question',
    primaryKey: 'id',
    properties: {
        id: 'int',
        questionId: 'int',
        question: 'string',
        acceptableAnswers: 'string',
        answered: 'bool',
        clues: 'Clues',
        selectedClues: 'SelectedClues',
        category: 'string'
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
        ENG: 'bool',
        question: {type: 'linkingObjects', objectType: 'Question', property: 'clues'}
    }
};

class SelectedClues extends Realm.Object {}
SelectedClues.schema = {
    name: 'SelectedClues',
    properties: {
        GK: 'string',
        DEF: 'string',
        MID: 'string',
        FWD: 'string',
        RET: 'string',
        ENG: 'string',
        question: {type: 'linkingObjects', objectType: 'Question', property: 'selectedClues'}
    }
};

export default new Realm({
    schema: [Question, Clues, SelectedClues],
    schemaVersion: 4,
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
        if (oldRealm.schemaVersion == 1 || oldRealm.schemaVersion == 2 || oldRealm.schemaVersion == 3) {
            const oldObjects = oldRealm.objects('Question');
            const newObjects = newRealm.objects('Question');
            for (let i = 0; i < oldObjects.length; i++) {
                newObjects[i].id = oldObjects[i].id;
                newObjects[i].answered = oldObjects[i].answered;
            }
        }
    }
});