// Schreibzugriff auf die Markierungen des Nutzers.
//
// Gegenstück zu `loadAnnotations` im rawStore, bewusst in einer eigenen Datei:
// Der rawStore gehört der Quelle und wird bei einem Quellenwechsel geräumt,
// diese Zeilen gehören dem Nutzer und überleben ihn.
//
// Alles rechnet in Zivildaten. Ein `CivilDate` ist die Einheit, in der die
// Auswertung Tage vergleicht; ein Zeitstempel entsteht erst beim Schreiben und
// wird beim Lesen wieder zum Tag.

import { eq } from 'drizzle-orm';
import { randomUUID } from 'expo-crypto';

import { db } from '@/data/local/database';
import { notifyTableChanged } from '@/data/local/tableVersions';
import { healthAnnotations } from '@/data/local/schema';
import type { AnnotationType } from '@/lib/health/algorithms/annotations';
import {
  civilDateToLocalEpochSeconds,
  localOffsetSeconds,
  type CivilDate,
} from '@/lib/health/civilDate';

export type MarkAnnotationInput = {
  readonly type: AnnotationType;
  readonly from: CivilDate;
  /** `null` legt eine offene Markierung an — „seit Freitag, noch nicht vorbei". */
  readonly to: CivilDate | null;
  readonly note?: string | null;
};

/**
 * Legt eine Markierung an und gibt ihren Schlüssel zurück.
 *
 * Der Zonenoffset wird **einmal jetzt** festgehalten und wandert mit in die
 * Zeile — dieselbe Begründung wie in der Tabelle: Ohne ihn verschöbe sich die
 * Abdeckung rückwirkend, sobald der Nutzer die Zone wechselt.
 */
export function markAnnotation(input: MarkAnnotationInput): string {
  const id = randomUUID();
  db.insert(healthAnnotations)
    .values({
      id,
      type: input.type,
      startTs: civilDateToLocalEpochSeconds(input.from),
      endTs: input.to === null ? null : civilDateToLocalEpochSeconds(input.to),
      tzOff: localOffsetSeconds(),
      note: input.note ?? null,
      createdAt: Date.now(),
    })
    .run();

  notifyTableChanged(healthAnnotations);
  return id;
}

/** Beendet eine offene Markierung an diesem Tag, einschließlich. */
export function endAnnotation(id: string, to: CivilDate): void {
  db.update(healthAnnotations)
    .set({ endTs: civilDateToLocalEpochSeconds(to) })
    .where(eq(healthAnnotations.id, id))
    .run();

  notifyTableChanged(healthAnnotations);
}

/** Verschiebt die Grenzen einer bestehenden Markierung. */
export function reshapeAnnotation(
  id: string,
  from: CivilDate,
  to: CivilDate | null,
): void {
  db.update(healthAnnotations)
    .set({
      startTs: civilDateToLocalEpochSeconds(from),
      endTs: to === null ? null : civilDateToLocalEpochSeconds(to),
    })
    .where(eq(healthAnnotations.id, id))
    .run();

  notifyTableChanged(healthAnnotations);
}

export function deleteAnnotation(id: string): void {
  db.delete(healthAnnotations).where(eq(healthAnnotations.id, id)).run();
  notifyTableChanged(healthAnnotations);
}
