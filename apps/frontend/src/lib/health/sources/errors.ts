export type AuthErrorKind =
  /** Zustimmung abgelaufen oder widerrufen. Muss in der UI sichtbar werden. */
  'needs_reauth' | 'cancelled' | 'server' | 'malformed_response';

/**
 * Warum eine Quelle nicht (mehr) liefert.
 *
 * Steht **quellenneutral** hier, weil zwei Stellen außerhalb der Adapter darauf
 * verzweigen: `syncHealthData` bricht bei `needs_reauth` den ganzen Lauf ab, und
 * die Oberfläche behandelt `cancelled` nicht als Fehler, sondern als
 * Entscheidung des Nutzers. Beides gilt für jede Quelle — Google erfährt es über
 * eine abgelehnte Token-Erneuerung, Health Connect über eine verweigerte
 * Zustimmung — und
 * keine der beiden Stellen darf dafür ausgerechnet den Google-Adapter
 * importieren müssen.
 */
export class AuthError extends Error {
  readonly kind: AuthErrorKind;

  constructor(kind: AuthErrorKind, message: string) {
    super(message);
    this.name = 'AuthError';
    this.kind = kind;
  }
}
