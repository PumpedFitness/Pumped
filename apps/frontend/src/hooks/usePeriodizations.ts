import { useCallback, useMemo } from 'react';
import { periodizations } from '@/data/local/schema';
import { useTableQuery } from '@/data/local/tableVersions';
import {
  deletePeriodization as deletePeriodizationFn,
  listPeriodizations,
  savePeriodization as savePeriodizationFn,
  setActivePeriodization,
} from '@/data/local/periodizations/periodizations';
import type {
  Periodization,
  SavePeriodizationInput,
} from '@/types/periodization';

type UsePeriodizationsResult = {
  periodizations: Periodization[];
  activePeriodization: Periodization | null;
  savePeriodization: (input: SavePeriodizationInput) => Periodization;
  setActive: (periodizationId: string, active: boolean) => void;
  deletePeriodization: (periodizationId: string) => void;
};

export function usePeriodizations(): UsePeriodizationsResult {
  const items = useTableQuery([periodizations], listPeriodizations);
  const activePeriodization = useMemo(
    () => items.find(item => item.isActive) ?? null,
    [items],
  );
  const savePeriodization = useCallback(
    (input: SavePeriodizationInput) => savePeriodizationFn(input),
    [],
  );
  const setActive = useCallback(
    (periodizationId: string, active: boolean) =>
      setActivePeriodization(periodizationId, active),
    [],
  );
  const deletePeriodization = useCallback(
    (periodizationId: string) => deletePeriodizationFn(periodizationId),
    [],
  );

  return {
    periodizations: items,
    activePeriodization,
    savePeriodization,
    setActive,
    deletePeriodization,
  };
}
