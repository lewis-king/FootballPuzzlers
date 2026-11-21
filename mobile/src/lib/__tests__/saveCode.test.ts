import { decodeSave, encodeSave, SaveCodeError, SaveData } from '../saveCode';

const save: SaveData = {
  answered: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 201, 212],
  clues: { 4: 0b011000, 120: 0b000001, 201: 0b100100 },
  letters: { 4: 2, 77: 3 },
  streak: { days: 12, lastDay: 2512 },
};

test('round-trips a save', () => {
  expect(decodeSave(encodeSave(save))).toEqual(save);
});

test('round-trips an empty save', () => {
  const empty: SaveData = { answered: [], clues: {}, letters: {}, streak: { days: 0, lastDay: 0 } };
  expect(decodeSave(encodeSave(empty))).toEqual(empty);
});

test('a full game stays short enough to paste', () => {
  const all = Array.from({ length: 400 }, (_, i) => i + 1);
  const clues = Object.fromEntries(all.map((id) => [id, 0b000011]));
  const code = encodeSave({ answered: all, clues, letters: {}, streak: { days: 400, lastDay: 3000 } });
  expect(code.length).toBeLessThan(1000);
});

test('a typical save is short', () => {
  expect(encodeSave(save).length).toBeLessThan(120);
});

test('forgives case, spaces, dashes and look-alike letters', () => {
  const code = encodeSave(save);
  const messy = ' ' + code.toLowerCase().replace(/-/g, ' ').replace(/1/g, 'l').replace(/0/g, 'o') + '\n';
  expect(decodeSave(messy)).toEqual(save);
});

test('catches a typo', () => {
  const code = encodeSave(save);
  const i = code.length - 6;
  const typo = code.slice(0, i) + (code[i] === 'A' ? 'B' : 'A') + code.slice(i + 1);
  expect(() => decodeSave(typo)).toThrow(SaveCodeError);
});

test('catches a truncated code', () => {
  const code = encodeSave(save);
  expect(() => decodeSave(code.slice(0, code.length - 5))).toThrow(SaveCodeError);
});

test('rejects rubbish', () => {
  expect(() => decodeSave('hello there')).toThrow(SaveCodeError);
  expect(() => decodeSave('')).toThrow(SaveCodeError);
});
