// Web preview and tests: purchases are simulated. The store implementation is purchases.native.ts.
export type BuyResult = { ok: boolean; simulated?: boolean; pending?: boolean; cancelled?: boolean; failed?: boolean; unavailable?: boolean };

export const fallbackPrice = () => '£1.99';
export function priceOf(_sku: string) {
  return fallbackPrice();
}
export async function startBilling(_onOwned: (sku: string) => void) {
  return false;
}
export async function buy(sku: string, onOwned: (sku: string) => void): Promise<BuyResult> {
  await new Promise((r) => setTimeout(r, 700));
  onOwned(sku);
  return { ok: true, simulated: true };
}
export async function restore(_onOwned: (sku: string) => void) {
  await new Promise((r) => setTimeout(r, 500));
  return { ok: true, found: [] as string[], simulated: true };
}
