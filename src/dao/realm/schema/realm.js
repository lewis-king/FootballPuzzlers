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

class Product extends Realm.Object {}
Product.schema = {
  name: 'Product',
  primaryKey: 'productId',
  properties: {
      productId: 'string',
      purchased: 'bool'
  }
};

export default new Realm({
    schema: [Question, Clues, SelectedClues],
    schemaVersion: 7,
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
        if (oldRealm.schemaVersion > 0 || oldRealm.schemaVersion <= 6) {
            const oldObjects = oldRealm.objects('Question');
            const newObjects = newRealm.objects('Question');
            for (let i = 0; i < oldObjects.length; i++) {
                newObjects[i].id = oldObjects[i].id;
                newObjects[i].answered = oldObjects[i].answered;
                newObjects[i].selectedClues = oldObjects[i].selectedClues;
            }
            const oldSCObjects = oldRealm.objects('SelectedClues');
            const newSCObjects = newRealm.objects('SelectedClues');
            for (let i = 0; i < oldSCObjects.length; i++) {
                newSCObjects[i].GK = oldSCObjects[i].GK;
                newSCObjects[i].DEF = oldSCObjects[i].DEF;
                newSCObjects[i].MID = oldSCObjects[i].MID;
                newSCObjects[i].FWD = oldSCObjects[i].FWD;
                newSCObjects[i].RET = oldSCObjects[i].RET;
                newSCObjects[i].ENG = oldSCObjects[i].ENG;
            }
        }
    }
});