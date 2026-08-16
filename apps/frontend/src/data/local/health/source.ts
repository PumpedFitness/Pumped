import { Platform } from 'react-native';
import { createMMKV } from 'react-native-mmkv';

import {
  googleHealthConfig,
  reversedClientIdScheme,
} from '@/lib/health/sources/google/config';
import { createGoogleHealthSource } from '@/lib/health/sources/google/googleHealthSource';
import { SourceRegistry } from '@/lib/health/sources/registry';

import {
  ANDROID_REDIRECT_SCHEME,
  GOOGLE_HEALTH_CLIENT_ID,
} from './googleClientId';
import { healthRawLayerStore } from './rawStore';

export { GOOGLE_HEALTH_CLIENT_ID };

export const googleHealth = googleHealthConfig({
  clientId: GOOGLE_HEALTH_CLIENT_ID,
  redirectScheme:
    Platform.OS === 'ios'
      ? reversedClientIdScheme(GOOGLE_HEALTH_CLIENT_ID)
      : ANDROID_REDIRECT_SCHEME,
});

/** Was tatsächlich in `Info.plist` bzw. `AndroidManifest.xml` steht. */
const REGISTERED_SCHEMES: readonly string[] =
  Platform.OS === 'ios'
    ? [reversedClientIdScheme(GOOGLE_HEALTH_CLIENT_ID)]
    : ['pumped', ANDROID_REDIRECT_SCHEME];

let schemeProblem: string | null = null;

const storage = createMMKV({ id: 'health-storage' });

export const googleHealthSource = createGoogleHealthSource({
  config: googleHealth,
  registeredSchemes: REGISTERED_SCHEMES,
  onConfigurationProblem: message => {
    schemeProblem = message;
    if (__DEV__) console.warn(`[health] ${message}`);
  },
});

/**
 * Die Quellen der App. Das erste Element ist der Vorgabewert.
 *
 * Eine zweite Quelle (HealthKit, Health Connect, ein Dateiimport) kommt hier
 * dazu und nirgends sonst — alles oberhalb kennt nur `HealthSource`.
 */
export const healthSources = new SourceRegistry({
  sources: [googleHealthSource],
  storage: {
    getString: key => storage.getString(key) ?? null,
    setString: (key, value) => storage.set(key, value),
  },
  rawLayer: healthRawLayerStore,
});

/**
 * Beim Start aufrufen. Meldet ein fehlendes URL-Schema, statt es erst beim
 * Rücksprung aus dem Consent als Netzwerkfehler auffallen zu lassen.
 */
export function validateHealthSources(): void {
  healthSources.validateConfiguration();
}

export function healthSourceSchemeProblem(): string | null {
  return schemeProblem;
}
