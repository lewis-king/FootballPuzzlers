import { getLocales } from 'expo-localization';

import { SKUS } from '../lib/game';
import { SIMULATE_STORE } from './config';

/**
 * Pack unlocks: Apple non-consumables / Google one-time products, the same ids as 2019 so existing
 * buyers restore them. Store billing only, no server. Every purchase is finished as soon as it
 * arrives (Google refunds anything not acknowledged within 3 days). Nothing is ever taken away
 * because a store can't be reached. Tester builds simulate the store.
 */
export type BuyResult = { ok: boolean; simulated?: boolean; pending?: boolean; cancelled?: boolean; failed?: boolean; unavailable?: boolean };

type Iap = typeof import('expo-iap');
// Loaded on first use so a launch without the store never touches it.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const iap = () => require('expo-iap') as Iap;

const prices: Record<string, string> = {};
let connection: Promise<boolean> | null = null;
let waiting: { sku: string; resolve: (r: BuyResult) => void } | null = null;

const settle = (sku: string, r: BuyResult) => {
  if (waiting?.sku !== sku) return;
  waiting.resolve(r);
  waiting = null;
};

/** A rough local price until the store answers (Lewis set £1.99; the stores convert it). */
export function fallbackPrice() {
  const region = getLocales()[0]?.regionCode ?? 'GB';
  return region === 'GB' ? '£1.99' : region === 'US' ? '$1.99' : '';
}
export const priceOf = (sku: string) => prices[sku] ?? fallbackPrice();

export function startBilling(onOwned: (sku: string) => void): Promise<boolean> {
  if (SIMULATE_STORE) return Promise.resolve(false);
  connection ??= (async () => {
    try {
      const { initConnection, fetchProducts, purchaseUpdatedListener, purchaseErrorListener, finishTransaction } = iap();
      purchaseUpdatedListener(async (purchase) => {
        if (!SKUS.includes(purchase.productId)) return;
        if (purchase.purchaseState === 'pending') return settle(purchase.productId, { ok: false, pending: true });
        if (purchase.purchaseState !== 'purchased') return;
        await finishTransaction({ purchase, isConsumable: false }).catch(() => {});
        onOwned(purchase.productId);
        settle(purchase.productId, { ok: true });
      });
      purchaseErrorListener((e) => {
        const sku = waiting?.sku;
        if (!sku) return;
        if (e.code === 'already-owned') {
          onOwned(sku);
          return settle(sku, { ok: true });
        }
        settle(sku, e.code === 'user-cancelled' ? { ok: false, cancelled: true } : { ok: false, failed: true });
      });
      await initConnection();
      const products = await fetchProducts({ skus: SKUS, type: 'in-app' });
      for (const p of products ?? []) if (p.displayPrice) prices[p.id] = p.displayPrice;
      return true;
    } catch {
      connection = null;
      return false;
    }
  })();
  return connection;
}

export async function buy(sku: string, onOwned: (sku: string) => void): Promise<BuyResult> {
  if (SIMULATE_STORE) {
    await new Promise((r) => setTimeout(r, 700));
    onOwned(sku);
    return { ok: true, simulated: true };
  }
  if (!(await startBilling(onOwned))) return { ok: false, unavailable: true };
  return new Promise((resolve) => {
    waiting = { sku, resolve };
    iap()
      .requestPurchase({ request: { apple: { sku }, google: { skus: [sku] } }, type: 'in-app' })
      .catch(() => settle(sku, { ok: false, failed: true }));
  });
}

/** Ask the store what this account owns. Used quietly at launch and from Restore purchases. */
export async function restore(onOwned: (sku: string) => void) {
  if (SIMULATE_STORE) {
    await new Promise((r) => setTimeout(r, 500));
    return { ok: true, found: [] as string[], simulated: true };
  }
  if (!(await startBilling(onOwned))) return { ok: false, found: [] as string[], unavailable: true };
  try {
    await iap().restorePurchases().catch(() => {});
    const owned = (await iap().getAvailablePurchases()).filter((p) => SKUS.includes(p.productId) && p.purchaseState === 'purchased');
    for (const p of owned) {
      await iap().finishTransaction({ purchase: p, isConsumable: false }).catch(() => {});
      onOwned(p.productId);
    }
    return { ok: true, found: owned.map((p) => p.productId) };
  } catch {
    return { ok: false, found: [] as string[] };
  }
}
