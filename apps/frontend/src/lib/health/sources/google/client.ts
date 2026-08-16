import type { GoogleHealthConfig } from './config';
import { pageSize, timeField, type DataTypeSpec } from './catalog';
import {
  asArray,
  asString,
  at,
  civilDateString,
  rfc3339,
  type Json,
} from './json';
import type { GoogleOAuthClient } from './oauth';
import type { TokenStore } from './tokenStore';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, detail: string) {
    super(
      status === 403
        ? `HTTP 403 — Health API im Projekt aktiviert? Scope vorhanden? (${detail})`
        : `HTTP ${status} — ${detail}`,
    );
    this.name = 'ApiError';
    this.status = status;
  }
}

const MAX_RETRIES = 3;

/**
 * Lesezugriff auf `users/me/dataTypes/{typ}/dataPoints`.
 *
 * Die API kennt **keinen Change-Cursor**. Inkrementelles Laden geht nur über
 * Zeitfenster; wer das ignoriert, verliert rückwirkende Korrekturen. Die
 * Fensterlogik gehört zum Speicher, hier steht nur der Transport.
 */
export class GoogleHealthApiClient {
  private readonly config: GoogleHealthConfig;
  private readonly auth: GoogleOAuthClient;
  private readonly store: TokenStore;
  private readonly wait: (ms: number) => Promise<void>;

  constructor(options: {
    config: GoogleHealthConfig;
    auth: GoogleOAuthClient;
    store: TokenStore;
    wait?: (ms: number) => Promise<void>;
  }) {
    this.config = options.config;
    this.auth = options.auth;
    this.store = options.store;
    this.wait =
      options.wait ??
      (ms => new Promise<void>(resolve => setTimeout(resolve, ms)));
  }

  /**
   * Läuft die Paginierung ab und reicht jede Seite einzeln weiter, damit große
   * Zeiträume nicht vollständig im Speicher landen.
   */
  async forEachPage(
    spec: DataTypeSpec,
    range: { from: Date | null; to: Date | null },
    handle: (points: readonly Json[]) => Promise<void>,
  ): Promise<void> {
    let pageToken: string | null = null;
    do {
      const query = new URLSearchParams({ pageSize: String(pageSize(spec)) });
      if (pageToken !== null) query.set('pageToken', pageToken);
      const filter = buildFilter(spec, range);
      if (filter !== null) query.set('filter', filter);

      const body = await this.get(
        `users/me/dataTypes/${spec.endpoint}/dataPoints`,
        query,
      );
      const points = asArray(at(body, 'dataPoints'));
      if (points.length > 0) await handle(points);
      pageToken = asString(at(body, 'nextPageToken'));
    } while (pageToken !== null);
  }

  /** Braucht `settings.readonly`, nicht `profile.readonly`. */
  async pairedDevices(): Promise<readonly Json[]> {
    const body = await this.get(
      'users/me/pairedDevices',
      new URLSearchParams(),
    );
    return asArray(at(body, 'pairedDevices'));
  }

  // MARK: - Transport

  private async get(path: string, query: URLSearchParams): Promise<Json> {
    let attempt = 0;
    let retriedUnauthorized = false;

    for (;;) {
      const suffix = query.toString();
      const url = `${this.config.apiBase}/${path}${suffix ? `?${suffix}` : ''}`;
      const token = await this.auth.validAccessToken();

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        return (await response.json()) as Json;
      }

      const detail = await failureMessage(response);

      if (response.status === 401 && !retriedUnauthorized) {
        // Access-Token abgelaufen. Einmal erneuern, dann erst aufgeben.
        retriedUnauthorized = true;
        this.store.invalidateAccessToken();
        continue;
      }

      if (response.status === 429 || response.status >= 500) {
        attempt += 1;
        if (attempt > MAX_RETRIES) throw new ApiError(response.status, detail);
        await this.wait(2 ** attempt * 1000);
        continue;
      }

      throw new ApiError(response.status, detail);
    }
  }
}

/** AIP-160. Nur `>=` und `<` werden unterstützt. */
export function buildFilter(
  spec: DataTypeSpec,
  range: { from: Date | null; to: Date | null },
): string | null {
  const literal = (date: Date) =>
    spec.shape === 'daily' ? civilDateString(date) : rfc3339(date);

  const clauses: string[] = [];
  if (range.from !== null) {
    clauses.push(`${timeField(spec)} >= "${literal(range.from)}"`);
  }
  if (range.to !== null) {
    clauses.push(`${timeField(spec)} < "${literal(range.to)}"`);
  }
  return clauses.length === 0 ? null : clauses.join(' AND ');
}

async function failureMessage(response: Response): Promise<string> {
  const text = await response.text().catch(() => '');
  try {
    const parsed: unknown = JSON.parse(text);
    const message = at(parsed as Json, 'error.message');
    if (typeof message === 'string') return message;
  } catch {
    // Keine JSON-Antwort — der Rohtext ist immer noch besser als nichts.
  }
  return text.slice(0, 200) || 'keine Details';
}
