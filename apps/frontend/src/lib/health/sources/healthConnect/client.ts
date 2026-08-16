import type {
  Permission,
  ReadRecordsResult,
  RecordType,
} from 'react-native-health-connect';

/**
 * Was der Adapter von `react-native-health-connect` braucht.
 *
 * Als Port formuliert, damit der Adapter ohne Gerät testbar bleibt: Health
 * Connect ist ein Systemdienst, den es weder in Jest noch auf iOS gibt.
 *
 * Die Namen und Formen sind die der Bibliothek — die Grenze verläuft hier
 * bewusst **nicht** entlang eines eigenen Vokabulars. Ein Port, der nur der
 * Testbarkeit dient, soll die fremde Schnittstelle spiegeln und nicht eine
 * zweite erfinden.
 */
export type HealthConnectClient = {
  /** Siehe `SdkAvailabilityStatus`. */
  getSdkStatus(): Promise<number>;
  initialize(): Promise<boolean>;
  getGrantedPermissions(): Promise<Permission[]>;
  requestPermission(permissions: readonly Permission[]): Promise<Permission[]>;
  readRecords<T extends RecordType>(
    recordType: T,
    options: {
      timeRangeFilter: {
        operator: 'between';
        startTime: string;
        endTime: string;
      };
      pageSize?: number;
      pageToken?: string;
      ascendingOrder?: boolean;
    },
  ): Promise<ReadRecordsResult<T>>;
};

/**
 * Wie viele Datensätze eine Seite fasst.
 *
 * Health Connect deckelt selbst bei 5000. Kleiner zu bleiben hält die Brücke
 * schmal: Eine Nacht Herzfrequenz sind je nach Uhr einige tausend Messpunkte,
 * und die stecken bei diesem Satztyp **innerhalb** der Datensätze.
 */
export const PAGE_SIZE = 1000;

/**
 * Alle Seiten eines Fensters, stückweise.
 *
 * Health Connect blättert über einen `pageToken`, und zwar auch dann, wenn man
 * das Fenster für klein hält — ein Jahr Herzfrequenz überschreitet jede
 * Seitengröße. `onPage` bekommt jede Seite einzeln, damit nie die ganze Antwort
 * zusammen im Speicher liegt.
 */
export async function forEachPage<T extends RecordType>(
  client: HealthConnectClient,
  recordType: T,
  window: { readonly from: Date; readonly to: Date },
  onPage: (records: ReadRecordsResult<T>['records']) => Promise<void>,
): Promise<void> {
  let pageToken: string | undefined;

  do {
    const result: ReadRecordsResult<T> = await client.readRecords(recordType, {
      timeRangeFilter: {
        operator: 'between',
        startTime: window.from.toISOString(),
        endTime: window.to.toISOString(),
      },
      pageSize: PAGE_SIZE,
      pageToken,
      ascendingOrder: true,
    });

    if (result.records.length > 0) await onPage(result.records);

    // Ohne die Längenprüfung dreht sich das hier ewig: Health Connect gibt am
    // Ende gern denselben Token mit einer leeren Seite zurück.
    pageToken = result.records.length > 0 ? result.pageToken : undefined;
  } while (pageToken !== undefined);
}
