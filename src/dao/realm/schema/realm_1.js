import Realm from 'realm';

class Question extends Realm.Object {}
Question.schema = {
    name: 'Question',
    primaryKey: 'id',
    properties: {
        id: 'int',
        question: 'string',
        acceptableAnswers: 'string',
        answered: 'bool'
    }
};

export default new Realm({schema: [Question]});