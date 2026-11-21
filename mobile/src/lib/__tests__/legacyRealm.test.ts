import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readLegacyRealm } from '../legacyRealm';

const fixtures = join(__dirname, '..', '..', '..', '..', 'tools', 'realm-legacy', 'fixtures');

test('reads progress from a 2019 Realm file', () => {
  const buf = new Uint8Array(readFileSync(join(fixtures, 'legacy-v7.realm')));
  const expected = JSON.parse(readFileSync(join(fixtures, 'legacy-v7.expected.json'), 'utf8'));
  const got = readLegacyRealm(buf);
  expect(got.answeredIds).toEqual(expected.answeredIds);
  expect(got.selectedClues).toEqual(expected.selectedClues);
  expect(got.purchased).toEqual(expected.purchased);
  expect(got.questionCount).toBe(expected.questionCount);
});

test('rejects a file that is not a Realm', () => {
  expect(() => readLegacyRealm(new Uint8Array(64))).toThrow();
});
