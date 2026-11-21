/** Tester builds simulate the store and use Google's test ads. Never on in a store build. */
export const SIMULATE_STORE = __DEV__ || process.env.EXPO_PUBLIC_SIMULATE_STORE === '1';

export const SUPPORT_EMAIL = 'hello@footballwhoami.com'; // forwarded to Lewis's Gmail by Cloudflare Email Routing

export const SITE = 'https://footballwhoami.com';

/** Show an interstitial after every Nth correct answer, as the 2019 app did between questions. */
export const INTERSTITIAL_EVERY = 4;

/** The new-pack alerts worker (workers/alerts). Unset means tokens are not sent anywhere yet. */
export const ALERTS_URL = process.env.EXPO_PUBLIC_ALERTS_URL ?? '';
