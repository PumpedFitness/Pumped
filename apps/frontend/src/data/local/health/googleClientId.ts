/**
 * Die OAuth-Kennungen des Google-Clients.
 *
 * Bewusst ein eigenes Modul ohne Importe: Ein Test liest von hier und
 * vergleicht gegen die echte `Info.plist` und das `AndroidManifest.xml`. Läge
 * die Konstante im Kompositionswurzel-Modul, zöge der Test `react-native` und
 * MMKV mit — und die Prüfung, die genau diese Zeile absichern soll, wäre die
 * erste, die man beim Aufräumen streicht.
 *
 * Kein Geheimnis: Öffentliche OAuth-Clients haben kein Secret; die Anmeldung
 * ist über PKCE und die Bundle-ID abgesichert.
 */
export const GOOGLE_HEALTH_CLIENT_ID =
  '822349081975-hi8i7c331nmm9oaipo1gjtjqvtmmitji.apps.googleusercontent.com';

/**
 * Das Schema, unter dem Android den Rücksprung entgegennimmt.
 *
 * Google prüft Android-Clients über Paketname und Signatur, nicht über die
 * Client-ID — deshalb ist das Schema hier der Paketname und nicht die
 * umgekehrte Client-ID wie auf iOS.
 */
export const ANDROID_REDIRECT_SCHEME = 'com.pumpedapp';
