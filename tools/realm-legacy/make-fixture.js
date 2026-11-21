// Builds a Realm file the way the 2019 app (realm@2.20.1, schemaVersion 7) wrote it,
// so the progress migration can be tested against a real legacy file.
// Run inside node:10:  node make-fixture.js <baseQuestions.json> <out.realm>
const Realm = require('realm');
const fs = require('fs');

const [questionsPath, outPath] = process.argv.slice(2);
const baseQuestions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

const Question = {
  name: 'Question', primaryKey: 'id',
  properties: {
    id: 'int', questionId: 'int', question: 'string', acceptableAnswers: 'string',
    answered: 'bool', clues: 'Clues', selectedClues: 'SelectedClues', category: 'string',
  },
};
const clueProps = (t) => ({ GK: t, DEF: t, MID: t, FWD: t, RET: t, ENG: t });
const Clues = {
  name: 'Clues',
  properties: { ...clueProps('bool'), question: { type: 'linkingObjects', objectType: 'Question', property: 'clues' } },
};
const SelectedClues = {
  name: 'SelectedClues',
  properties: { ...clueProps('string'), question: { type: 'linkingObjects', objectType: 'Question', property: 'selectedClues' } },
};
const Product = { name: 'Product', primaryKey: 'productId', properties: { productId: 'string', purchased: 'bool' } };

if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
const realm = new Realm({ path: outPath, schema: [Question, Clues, SelectedClues, Product], schemaVersion: 7 });

// Same upsert as QuestionsDAO.persistQuestionsToDB (so the duplicate id 201 overwrites, as on devices)
const empty = { GK: '', DEF: '', MID: '', FWD: '', RET: '', ENG: '' };
realm.write(() => {
  baseQuestions.forEach((q) => {
    const { GK, DEF, MID, FWD, RET, ENG } = q.clues;
    realm.create('Question', {
      id: q.id, questionId: q.questionId, question: q.question,
      acceptableAnswers: q.acceptableAnswers.toString(),
      clues: { GK, DEF, MID, FWD, RET, ENG }, answered: false,
      selectedClues: { ...empty }, category: q.category,
    }, true);
  });
});

// Known progress pattern the migration test asserts against
const answeredIds = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 91, 100, 152, 201, 211];
realm.write(() => {
  answeredIds.forEach((id) => realm.create('Question', { id, answered: true }, true));
  realm.create('Question', { id: 4, selectedClues: { ...empty, FWD: 'True', ENG: 'True' } }, true);
  realm.create('Question', { id: 120, selectedClues: { ...empty, GK: 'False' } }, true);
  realm.create('Product', { productId: 'com.footballwhoami.worldcup_1', purchased: true }, true);
});

const expected = {
  answeredIds,
  selectedClues: { 4: { FWD: 'True', ENG: 'True' }, 120: { GK: 'False' } },
  purchased: ['com.footballwhoami.worldcup_1'],
  questionCount: realm.objects('Question').length,
  clueRows: realm.objects('Clues').length,
};
realm.close();
fs.writeFileSync(outPath.replace(/\.realm$/, '.expected.json'), JSON.stringify(expected, null, 2));
console.log('wrote', outPath, JSON.stringify({ questions: expected.questionCount, clueRows: expected.clueRows }));
