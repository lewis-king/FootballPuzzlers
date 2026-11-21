import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
import * as StoreReview from 'expo-store-review';
import { Linking, Platform } from 'react-native';

import { PACKS } from '../lib/game';

import { ALERTS_URL } from './config';

/**
 * New-pack notifications. The only thing ever sent is "a new pack is out", so there is one channel
 * and one stored value: this phone's Expo push token, kept by the small alerts worker
 * (workers/alerts). Nothing else about the player leaves the phone.
 */

const CHANNEL = 'new-packs';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldPlaySound: false, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }),
});

async function token(): Promise<string | null> {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;
  try {
    return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch {
    return null; // offline, or push not set up in this build; we try again on the next launch
  }
}

async function send(method: 'PUT' | 'DELETE', t: string) {
  if (!ALERTS_URL) return;
  await fetch(`${ALERTS_URL}/token`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token: t, platform: Platform.OS }),
  }).catch(() => {});
}

export async function enableAlerts(): Promise<boolean> {
  // Android 13+ shows the permission prompt only once a channel exists.
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: 'New packs',
    description: 'One notification when a new question pack comes out',
    importance: AndroidImportance.DEFAULT,
  }).catch(() => null);
  let perm = await Notifications.getPermissionsAsync();
  if (!perm.granted && perm.canAskAgain) perm = await Notifications.requestPermissionsAsync();
  const allowed = perm.granted || perm.ios?.status === IosAuthorizationStatus.PROVISIONAL;
  if (!allowed) return false;
  const t = await token();
  if (t) await send('PUT', t);
  return true;
}

export async function disableAlerts(): Promise<void> {
  const t = await token();
  if (t) await send('DELETE', t);
}

export async function refreshAlerts(): Promise<void> {
  const perm = await Notifications.getPermissionsAsync().catch(() => null);
  if (!perm?.granted) return;
  const t = await token();
  if (t) await send('PUT', t);
}

/**
 * Tapping a new-pack notification. The send includes the pack id; a phone on an older version
 * doesn't have that pack yet, so it goes to the store page to update instead of opening an app
 * that looks unchanged. Returns a function that stops listening.
 */
export function handleAlertTaps(openHome: () => void): () => void {
  const open = (r: Notifications.NotificationResponse | null) => {
    const pack = r?.notification.request.content.data?.pack;
    if (typeof pack !== 'string') return;
    if (PACKS.some((p) => p.id === pack)) return openHome();
    const url = StoreReview.storeUrl();
    if (url) Linking.openURL(url).catch(() => {});
  };
  Notifications.getLastNotificationResponseAsync().then(open).catch(() => {});
  const sub = Notifications.addNotificationResponseReceivedListener(open);
  return () => sub.remove();
}
