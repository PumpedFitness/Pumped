import * as SecureStore from 'expo-secure-store';

/**
 * Was der Tokenspeicher vom Gerät braucht. Als Port, damit sich der
 * OAuth-Fluss ohne Keychain testen lässt.
 */
export type SecureStorage = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
};

export const keychainStorage: SecureStorage = {
  get: key => SecureStore.getItemAsync(key),
  set: (key, value) => SecureStore.setItemAsync(key, value),
  remove: key => SecureStore.deleteItemAsync(key),
};

const REFRESH_KEY = 'health.google.refresh_token';
const CONSENTED_KEY = 'health.google.consented_at';

/**
 * Hält die Google-Token.
 *
 * Das **Refresh-Token** liegt in der Keychain — es ist der eigentliche
 * Dauerzugang und überlebt Neustarts. Das **Access-Token** bleibt im Speicher:
 * Es lebt eine Stunde, lässt sich jederzeit neu holen, und was nicht auf der
 * Platte steht, kann von dort auch nicht gestohlen werden.
 */
export class TokenStore {
  private readonly storage: SecureStorage;
  private access: { token: string; expiresAt: number } | null = null;

  constructor(storage: SecureStorage = keychainStorage) {
    this.storage = storage;
  }

  /** Gültiges Access-Token oder `null`, wenn keins da oder abgelaufen. */
  get accessToken(): string | null {
    if (this.access === null) return null;
    // Eine Minute Sicherheitsabstand: Ein Token, das während des Requests
    // abläuft, kostet einen 401 und einen zweiten Anlauf.
    return this.access.expiresAt - 60_000 > Date.now()
      ? this.access.token
      : null;
  }

  storeAccessToken(token: string, expiresInSeconds: number): void {
    this.access = { token, expiresAt: Date.now() + expiresInSeconds * 1000 };
  }

  invalidateAccessToken(): void {
    this.access = null;
  }

  async refreshToken(): Promise<string | null> {
    return this.storage.get(REFRESH_KEY);
  }

  async setRefreshToken(token: string): Promise<void> {
    await this.storage.set(REFRESH_KEY, token);
  }

  async consentedAt(): Promise<Date | null> {
    const stored = await this.storage.get(CONSENTED_KEY);
    if (stored === null) return null;
    const parsed = Number(stored);
    return Number.isFinite(parsed) ? new Date(parsed) : null;
  }

  async setConsentedAt(date: Date): Promise<void> {
    await this.storage.set(CONSENTED_KEY, String(date.getTime()));
  }

  async clear(): Promise<void> {
    this.access = null;
    await this.storage.remove(REFRESH_KEY);
    await this.storage.remove(CONSENTED_KEY);
  }
}
