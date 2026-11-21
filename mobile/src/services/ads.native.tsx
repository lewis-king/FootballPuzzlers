import { Platform, View } from 'react-native';
import mobileAds, {
  AdEventType,
  AdsConsent,
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

import { INTERSTITIAL_EVERY, SIMULATE_STORE } from './config';

// The 2019 app's ad units, kept so reporting carries on in the same AdMob account.
const UNITS = Platform.select({
  android: { banner: 'ca-app-pub-5964830289406172/2390323530', interstitial: 'ca-app-pub-5964830289406172/1517036977', rewarded: 'ca-app-pub-5964830289406172/2139718423' },
  default: { banner: 'ca-app-pub-5964830289406172/9312671442', interstitial: 'ca-app-pub-5964830289406172/6822239473', rewarded: 'ca-app-pub-5964830289406172/1062440473' },
});
const unit = (k: keyof typeof UNITS) =>
  SIMULATE_STORE ? { banner: TestIds.ADAPTIVE_BANNER, interstitial: TestIds.INTERSTITIAL, rewarded: TestIds.REWARDED }[k] : UNITS[k];

let ready: Promise<boolean> | null = null;
let interstitial: InterstitialAd | null = null;
let rewarded: RewardedAd | null = null;
let rewardedLoaded = false;
let correctCount = 0;

/** Ask for consent where the law needs it (UK, EEA), then start the SDK and preload ads. */
export function startAds(): Promise<boolean> {
  ready ??= (async () => {
    try {
      await AdsConsent.gatherConsent().catch(() => null);
      const { canRequestAds } = await AdsConsent.getConsentInfo();
      if (!canRequestAds) return false;
      await mobileAds().initialize();
      loadInterstitial();
      loadRewarded();
      return true;
    } catch {
      ready = null;
      return false;
    }
  })();
  return ready;
}

function loadInterstitial() {
  interstitial = InterstitialAd.createForAdRequest(unit('interstitial'));
  interstitial.addAdEventListener(AdEventType.CLOSED, loadInterstitial);
  interstitial.load();
}

function loadRewarded() {
  rewardedLoaded = false;
  rewarded = RewardedAd.createForAdRequest(unit('rewarded'));
  rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => (rewardedLoaded = true));
  rewarded.addAdEventListener(AdEventType.ERROR, () => (rewardedLoaded = false));
  rewarded.load();
}

/**
 * Play a rewarded ad. Resolves true if the player earned the reward. If no ad could be loaded
 * (offline, no fill, no consent), the letter is given anyway: the player asked for help and
 * it isn't their fault there was no ad.
 */
export async function showRewarded(): Promise<boolean> {
  if (!(await startAds()) || !rewarded || !rewardedLoaded) {
    if (rewarded && !rewardedLoaded) loadRewarded();
    return true;
  }
  const ad = rewarded;
  return new Promise((resolve) => {
    let earned = false;
    const offEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => (earned = true));
    const offClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      offEarned();
      offClosed();
      loadRewarded();
      resolve(earned);
    });
    ad.show().catch(() => {
      offEarned();
      offClosed();
      loadRewarded();
      resolve(true);
    });
  });
}

/** Called on each correct answer; shows an interstitial every few, if one is ready. */
export function maybeShowInterstitial() {
  correctCount++;
  if (correctCount % INTERSTITIAL_EVERY !== 0) return;
  if (interstitial?.loaded) interstitial.show().catch(() => {});
}

export function Banner() {
  return (
    <View style={{ alignItems: 'center', minHeight: 50 }}>
      <BannerAd unitId={unit('banner')} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}
