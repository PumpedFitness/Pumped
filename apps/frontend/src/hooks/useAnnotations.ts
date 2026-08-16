import { loadAnnotations } from '@/data/local/health/rawStore';
import * as schema from '@/data/local/schema';
import { useTableQuery } from '@/data/local/tableVersions';
import type { Annotation } from '@/lib/health/algorithms/annotations';

/**
 * Nur die Markierungen des Nutzers, ohne die Auswertung ringsherum.
 *
 * `useHealthSnapshot` liefert sie auch, rechnet dafür aber die ganzen Reihen
 * neu — je Komponente, denn der Cache in `useTableQuery` hängt an der Instanz.
 * Wer nur wissen will, ob gerade eine Krankheit eingetragen ist, soll dafür
 * nicht die Schlafhistorie durchgehen.
 */
export function useAnnotations(): Annotation[] {
  return useTableQuery([schema.healthAnnotations], () => loadAnnotations());
}
