import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';

import { AuthError, type AuthErrorKind } from '../errors';
import { redirectUri, type GoogleHealthConfig } from './config';
import type { TokenStore } from './tokenStore';

/**
 * Öffnet den Consent im Systembrowser und liefert die Rücksprung-URL.
 *
 * Als Port, damit der Fluss ohne Gerät testbar ist — und weil Google
 * OAuth in eingebetteten WebViews aus gutem Grund ablehnt.
 */
export type ConsentPresenter = (options: {
  url: string;
  redirectUri: string;
  scheme: string;
}) => Promise<{ type: 'success'; url: string } | { type: 'cancel' }>;

export const systemBrowserConsent: ConsentPresenter = async ({
  url,
  redirectUri: redirect,
}) => {
  const result = await WebBrowser.openAuthSessionAsync(url, redirect);
  return result.type === 'success'
    ? { type: 'success', url: result.url }
    : { type: 'cancel' };
};

type TokenResponse = {
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
};

/**
 * OAuth 2.0 mit PKCE gegen Google, ohne Client Secret.
 */
export class GoogleOAuthClient {
  private readonly config: GoogleHealthConfig;
  private readonly store: TokenStore;
  private readonly presentConsent: ConsentPresenter;
  private refreshing: Promise<string> | null = null;

  constructor(options: {
    config: GoogleHealthConfig;
    store: TokenStore;
    presentConsent?: ConsentPresenter;
  }) {
    this.config = options.config;
    this.store = options.store;
    this.presentConsent = options.presentConsent ?? systemBrowserConsent;
  }

  // MARK: - Anmeldung

  async authorize(): Promise<void> {
    const verifier = base64UrlEncode(Crypto.getRandomBytes(32));
    const state = base64UrlEncode(Crypto.getRandomBytes(24));
    const challenge = await codeChallenge(verifier);

    const authUrl = new URL(this.config.authEndpoint);
    authUrl.searchParams.set('client_id', this.config.clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri(this.config));
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', this.config.scopes.join(' '));
    authUrl.searchParams.set('code_challenge', challenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('state', state);
    // Beides zwingend, sonst kommt kein Refresh-Token zurück.
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    const outcome = await this.presentConsent({
      url: authUrl.toString(),
      redirectUri: redirectUri(this.config),
      scheme: this.config.redirectScheme,
    });
    if (outcome.type === 'cancel') {
      throw new AuthError('cancelled', 'Anmeldung abgebrochen');
    }

    const params = new URL(outcome.url).searchParams;
    const error = params.get('error');
    if (error !== null) {
      throw new AuthError('server', params.get('error_description') ?? error);
    }
    if (params.get('state') !== state) {
      throw new AuthError('server', 'State stimmt nicht — Abbruch');
    }
    const code = params.get('code');
    if (code === null) {
      throw new AuthError('malformed_response', 'Kein Code im Rücksprung');
    }

    const response = await this.postToken({
      client_id: this.config.clientId,
      code,
      code_verifier: verifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri(this.config),
    });

    if (response.refreshToken === null) {
      throw new AuthError(
        'server',
        'Kein Refresh-Token erhalten. Meist fehlt access_type=offline oder prompt=consent.',
      );
    }

    await this.store.setRefreshToken(response.refreshToken);
    await this.store.setConsentedAt(new Date());
    this.store.storeAccessToken(response.accessToken, response.expiresIn);
  }

  // MARK: - Token

  /**
   * Gibt ein gültiges Access-Token zurück und erneuert es bei Bedarf.
   *
   * Nebenläufige Aufrufe teilen sich eine Erneuerung: Ein Sync über fünf
   * Metriken würde sonst fünf Refresh-Requests gleichzeitig abschicken, und
   * Google invalidiert dabei unter Umständen das Refresh-Token.
   */
  async validAccessToken(): Promise<string> {
    const cached = this.store.accessToken;
    if (cached !== null) return cached;
    if (this.refreshing !== null) return this.refreshing;

    this.refreshing = this.refreshAccessToken().finally(() => {
      this.refreshing = null;
    });
    return this.refreshing;
  }

  private async refreshAccessToken(): Promise<string> {
    const refresh = await this.store.refreshToken();
    if (refresh === null) {
      throw new AuthError('needs_reauth', 'noch nicht angemeldet');
    }
    const response = await this.postToken({
      client_id: this.config.clientId,
      refresh_token: refresh,
      grant_type: 'refresh_token',
    });
    this.store.storeAccessToken(response.accessToken, response.expiresIn);
    return response.accessToken;
  }

  async signOut(): Promise<void> {
    await this.store.clear();
  }

  // MARK: - Intern

  private async postToken(
    fields: Record<string, string>,
  ): Promise<TokenResponse> {
    const response = await fetch(this.config.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(fields).toString(),
    });

    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const detail =
        readString(body, 'error_description') ??
        readString(body, 'error') ??
        `HTTP ${response.status}`;
      // Ein abgelehntes Refresh-Token heißt: von vorn anmelden. Das ist etwas
      // anderes als ein Serverfehler und gehört in der UI anders behandelt.
      const kind: AuthErrorKind =
        readString(body, 'error') === 'invalid_grant'
          ? 'needs_reauth'
          : 'server';
      throw new AuthError(kind, detail);
    }

    const accessToken = readString(body, 'access_token');
    const expiresIn = readNumber(body, 'expires_in');
    if (accessToken === null || expiresIn === null) {
      throw new AuthError('malformed_response', 'Token-Antwort unvollständig');
    }

    return {
      accessToken,
      refreshToken: readString(body, 'refresh_token'),
      expiresIn,
    };
  }
}

// MARK: - PKCE

async function codeChallenge(verifier: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 },
  );
  return toBase64Url(digest);
}

const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64UrlEncode(bytes: Uint8Array): string {
  let out = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const chunk =
      (bytes[index] << 16) |
      ((bytes[index + 1] ?? 0) << 8) |
      (bytes[index + 2] ?? 0);
    const remaining = bytes.length - index;
    out += BASE64_ALPHABET[(chunk >> 18) & 63];
    out += BASE64_ALPHABET[(chunk >> 12) & 63];
    if (remaining > 1) out += BASE64_ALPHABET[(chunk >> 6) & 63];
    if (remaining > 2) out += BASE64_ALPHABET[chunk & 63];
  }
  return out;
}

function toBase64Url(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function readString(body: unknown, key: string): string | null {
  if (typeof body !== 'object' || body === null) return null;
  const value = (body as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : null;
}

function readNumber(body: unknown, key: string): number | null {
  if (typeof body !== 'object' || body === null) return null;
  const value = (body as Record<string, unknown>)[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
