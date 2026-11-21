import { currentStreak, dayNumber, isCorrect, isNearMiss, surnameOf, nextStreak, normalise, QUESTIONS, questionById, revealedPrefix } from '../game';

const q = (answers: string[]) => ({ id: 1, pack: 'starter' as const, text: '', answers, clues: 0 });

test('answers forgive case, accents, spaces and hyphens', () => {
  const perez = q(['Lucas Pérez', 'Pérez']);
  expect(isCorrect('perez', perez)).toBe(true);
  expect(isCorrect('  LUCAS PEREZ ', perez)).toBe(true);
  expect(isCorrect('Ji sung', q(['Park Ji-sung', 'Ji-sung']))).toBe(true);
  expect(isCorrect('Solskjaer', q(['Ole Gunnar Solskjær', 'Solskjær']))).toBe(true);
});

test('answers still need the right spelling', () => {
  expect(isCorrect('Gerard', q(['Steven Gerrard', 'Gerrard']))).toBe(false);
  expect(isCorrect('', q(['Gerrard']))).toBe(false);
  expect(normalise('Mané')).toBe('mane');
});

test('revealed letters are the start of the surname', () => {
  expect(revealedPrefix(q(['Wayne Rooney', 'Rooney']), 2)).toBe('Ro');
  expect(revealedPrefix(q(['Ronaldinho']), 3)).toBe('Ron');
});

test('the daily streak counts consecutive days and lapses after a missed day', () => {
  let s = { days: 0, lastDay: -10 };
  s = nextStreak(s, 100);
  expect(s).toEqual({ days: 1, lastDay: 100 });
  s = nextStreak(s, 100);
  expect(s.days).toBe(1);
  s = nextStreak(s, 101);
  expect(s.days).toBe(2);
  expect(currentStreak(s, 102)).toBe(2);
  expect(currentStreak(s, 103)).toBe(0);
  expect(nextStreak(s, 104)).toEqual({ days: 1, lastDay: 104 });
});

test('day numbers follow the local calendar day', () => {
  expect(dayNumber(new Date(2020, 0, 1, 23, 59))).toBe(0);
  expect(dayNumber(new Date(2020, 0, 2, 0, 1))).toBe(1);
});

test('question ids are unique, and 201 is the question 2019 players actually had', () => {
  const ids = QUESTIONS.map((x) => x.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(questionById(201)!.answers[0]).toBe('Lucas Pérez');
  expect(questionById(212)!.answers[0]).toBe('David Beckham');
});

describe('near misses', () => {
  const q = { id: 9, pack: 'starter' as const, text: '', answers: ['Sadio Mané', 'Mané'], clues: 0 };
  it('spots a letter or two out', () => {
    expect(isNearMiss('Marne', q)).toBe(true);
    expect(isNearMiss('Sadio Manne', q)).toBe(true);
    expect(isNearMiss('Sadeo Mano', q)).toBe(true);
  });
  it('ignores real misses and tiny guesses', () => {
    expect(isNearMiss('Salah', q)).toBe(false);
    expect(isNearMiss('Ma', q)).toBe(false);
  });
  it('gives the surname for tiles', () => {
    expect(surnameOf(q)).toBe('Mané');
  });
});
