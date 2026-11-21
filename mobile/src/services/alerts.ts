// Web preview and tests: new-pack alerts are simulated. The real one is alerts.native.ts.

/** Ask for permission and register this phone for new-pack notifications. */
export async function enableAlerts(): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 300));
  return true;
}

/** Stop new-pack notifications for this phone. */
export async function disableAlerts(): Promise<void> {}

/** Re-send the token on launch if alerts are on (tokens can change). */
export async function refreshAlerts(): Promise<void> {}

/** Tapping a new-pack notification (native only). */
export function handleAlertTaps(_openHome: () => void): () => void {
  return () => {};
}
