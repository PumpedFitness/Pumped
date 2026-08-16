import { syncedAtKey } from '@/screens/health/formatMetric';

describe('Zuletzt geladen', () => {
  const now = Date.parse('2026-08-12T12:00:00Z');
  const agoSeconds = (seconds: number) => now - seconds * 1000;

  it('nennt die Sekunden nicht beim Namen', () => {
    // Unter einer Minute ist „gerade eben" genauer als eine Zahl, die sich
    // zwischen Ablesen und Verstehen schon geändert hat.
    expect(syncedAtKey(agoSeconds(0), now).key).toBe(
      'health.metrics.syncedNow',
    );
    expect(syncedAtKey(agoSeconds(59), now).key).toBe(
      'health.metrics.syncedNow',
    );
  });

  it('zählt Minuten, dann Stunden, dann Tage', () => {
    expect(syncedAtKey(agoSeconds(60), now)).toEqual({
      key: 'health.metrics.syncedMinutes',
      count: 1,
    });
    expect(syncedAtKey(agoSeconds(59 * 60), now)).toEqual({
      key: 'health.metrics.syncedMinutes',
      count: 59,
    });
    expect(syncedAtKey(agoSeconds(3600), now)).toEqual({
      key: 'health.metrics.syncedHours',
      count: 1,
    });
    expect(syncedAtKey(agoSeconds(47 * 3600), now)).toEqual({
      key: 'health.metrics.syncedDays',
      count: 1,
    });
  });

  it('unterscheidet „nie geladen" von „gerade eben"', () => {
    // Ein fehlender Zeitstempel ist keine frische Aktualisierung. Ohne diese
    // Trennung meldete ein Neustart vor dem ersten Sync „gerade eben".
    expect(syncedAtKey(null, now).key).toBe('health.metrics.neverSynced');
  });

  it('meldet keine Zukunft, wenn die Uhr zurückspringt', () => {
    // Zeitumstellung oder eine korrigierte Systemuhr — negative Alter dürfen
    // nicht als „vor -3 Minuten" durchschlagen.
    expect(syncedAtKey(now + 60_000, now).key).toBe('health.metrics.syncedNow');
  });
});
