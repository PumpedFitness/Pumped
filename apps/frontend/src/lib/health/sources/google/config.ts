/**
 * Zugangsdaten und Endpunkte für die Google Health API.
 *
 * **Voraussetzung:** In der Google Cloud Console muss ein OAuth-Client vom Typ
 * **iOS** bzw. **Android** existieren, ausgestellt auf die Bundle-ID der App.
 * Ein Desktop-Client akzeptiert nur Loopback-Redirects und funktioniert auf dem
 * Gerät nicht.
 *
 * Das Rücksprung-Schema unterscheidet sich je Plattform, weil Google die beiden
 * Client-Typen verschieden behandelt:
 *
 * - **iOS** — die *umgekehrte* Client-ID, registriert unter
 *   `CFBundleURLSchemes` in der `Info.plist`.
 * - **Android** — der *Paketname*, registriert als `intent-filter` im
 *   Manifest. Der Client wird über Paketname und Signatur geprüft, nicht über
 *   die Client-ID im Schema.
 *
 * Wer beides gleichsetzt, bekommt den Fehler erst beim Rücksprung aus dem
 * Consent, und dort sieht er wie ein Netzwerkproblem aus. `validateRedirectScheme`
 * vergleicht deshalb beim Start gegen die tatsächlich registrierten Schemata.
 */
export type GoogleHealthConfig = {
  readonly clientId: string;
  /** Registriertes URL-Schema für den Rücksprung, ohne `:/oauth2redirect`. */
  readonly redirectScheme: string;
  readonly scopes: readonly string[];
  readonly authEndpoint: string;
  readonly tokenEndpoint: string;
  readonly apiBase: string;
};

/**
 * Die vier nötigen Scopes.
 *
 * `settings.readonly` wird für `users/me/pairedDevices` gebraucht — nicht
 * `profile.readonly`, wie man vermuten würde.
 */
export const GOOGLE_HEALTH_SCOPES: readonly string[] = [
  'https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly',
  'https://www.googleapis.com/auth/googlehealth.sleep.readonly',
  'https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly',
  'https://www.googleapis.com/auth/googlehealth.settings.readonly',
];

export function googleHealthConfig(options: {
  clientId: string;
  redirectScheme: string;
}): GoogleHealthConfig {
  return {
    clientId: options.clientId,
    redirectScheme: options.redirectScheme,
    scopes: GOOGLE_HEALTH_SCOPES,
    authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    apiBase: 'https://health.googleapis.com/v4',
  };
}

/** Das iOS-Schema: die umgekehrte Client-ID. */
export function reversedClientIdScheme(clientId: string): string {
  return `com.googleusercontent.apps.${clientId.replace(
    '.apps.googleusercontent.com',
    '',
  )}`;
}

export function redirectUri(config: GoogleHealthConfig): string {
  return `${config.redirectScheme}:/oauth2redirect`;
}

/**
 * Vergleicht das erwartete Schema mit den registrierten.
 *
 * Gibt den Fehlertext zurück statt zu werfen — die Prüfung läuft beim Start und
 * soll die App nicht daran hindern, ihre übrigen Funktionen zu zeigen.
 */
export function validateRedirectScheme(
  config: GoogleHealthConfig,
  registeredSchemes: readonly string[],
): string | null {
  if (registeredSchemes.includes(config.redirectScheme)) return null;
  return [
    'URL-Schema nicht registriert.',
    `  erwartet:    ${config.redirectScheme}`,
    `  registriert: ${registeredSchemes.join(', ') || '(keine)'}`,
  ].join('\n');
}
