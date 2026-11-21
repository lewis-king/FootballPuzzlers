import { File, Paths } from 'expo-file-system';

import { LegacyProgress, readLegacyRealm } from './legacyRealm';

/**
 * The 2019 app kept progress in Realm's default file. realm-js put it in the app's files directory
 * on Android and in Documents on iOS, which is where expo-file-system's Paths.document points, and an
 * app update keeps that directory. Returns null if there is no old save or it can't be read.
 */
export async function findLegacySave(): Promise<LegacyProgress | null> {
  try {
    const file = new File(Paths.document, 'default.realm');
    if (!file.exists) return null;
    return readLegacyRealm(await file.bytes());
  } catch (e) {
    console.warn('[legacy] could not read the 2019 save', e);
    return null;
  }
}
