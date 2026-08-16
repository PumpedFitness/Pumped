import { readFileSync } from 'fs';
import { join } from 'path';

import {
  ANDROID_REDIRECT_SCHEME,
  GOOGLE_HEALTH_CLIENT_ID,
} from '@/data/local/health/googleClientId';
import { reversedClientIdScheme } from '../sources/google/config';

/**
 * Die Client-ID steht in TypeScript, das Rücksprung-Schema in zwei nativen
 * Dateien. Laufen sie auseinander, bricht die Anmeldung erst beim Rücksprung
 * aus dem Consent ab — und sieht dort wie ein Netzwerkfehler aus.
 *
 * `validateConfiguration()` prüft dasselbe zur Laufzeit, aber nur gegen eine
 * zweite TypeScript-Konstante. Erst dieser Test liest die nativen Dateien
 * wirklich und macht die Prüfung damit zu einer Aussage über den Build.
 */
const root = process.cwd();

describe('OAuth-Rücksprung', () => {
  it('registriert die umgekehrte Client-ID in der Info.plist', () => {
    const plist = readFileSync(join(root, 'ios/PumpedApp/Info.plist'), 'utf-8');
    const expected = reversedClientIdScheme(GOOGLE_HEALTH_CLIENT_ID);

    expect(expected).toMatch(/^com\.googleusercontent\.apps\./);
    expect(plist).toContain('<key>CFBundleURLSchemes</key>');
    expect(plist).toContain(`<string>${expected}</string>`);
  });

  it('registriert den Paketnamen im AndroidManifest', () => {
    const manifest = readFileSync(
      join(root, 'android/app/src/main/AndroidManifest.xml'),
      'utf-8',
    );
    expect(manifest).toContain(
      `<data android:scheme="${ANDROID_REDIRECT_SCHEME}"/>`,
    );
  });

  it('hält das Android-Schema am Paketnamen der Anwendung', () => {
    const gradle = readFileSync(
      join(root, 'android/app/build.gradle'),
      'utf-8',
    );
    expect(gradle).toContain(`applicationId '${ANDROID_REDIRECT_SCHEME}'`);
  });

  it('hält die iOS-Bundle-ID am selben Wert', () => {
    const project = readFileSync(
      join(root, 'ios/PumpedApp.xcodeproj/project.pbxproj'),
      'utf-8',
    );
    // Beide Konfigurationen, Debug und Release.
    const matches = project.match(
      /PRODUCT_BUNDLE_IDENTIFIER = com\.pumpedapp;/g,
    );
    expect(matches).toHaveLength(2);
  });
});
