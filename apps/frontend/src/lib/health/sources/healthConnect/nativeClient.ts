import { Platform } from 'react-native';

import type { HealthConnectClient } from './client';

/**
 * Der echte Client, sofern es auf dieser Plattform einen geben kann.
 *
 * `null` auf iOS — und zwar **ohne** `react-native-health-connect` überhaupt zu
 * laden. Die Bibliothek ist Android-only; ihr Import auf iOS ist der Fehler, den
 * man erst beim ersten Aufruf sähe, und dann als etwas anderes. Deshalb der
 * `require` hinter der Plattformprüfung statt eines Imports oben.
 *
 * Dass Health Connect auf dem Gerät **fehlt** oder veraltet ist, ist damit nicht
 * gesagt — das beantwortet `getSdkStatus`, und der Adapter macht daraus ein
 * `unavailable` mit Begründung.
 */
export function resolveHealthConnectClient(): HealthConnectClient | null {
  if (Platform.OS !== 'android') return null;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const module = require('react-native-health-connect') as HealthConnectClient;

  return {
    getSdkStatus: () => module.getSdkStatus(),
    initialize: () => module.initialize(),
    getGrantedPermissions: () => module.getGrantedPermissions(),
    requestPermission: permissions =>
      module.requestPermission([...permissions]),
    readRecords: (recordType, options) =>
      module.readRecords(recordType, options),
  };
}
