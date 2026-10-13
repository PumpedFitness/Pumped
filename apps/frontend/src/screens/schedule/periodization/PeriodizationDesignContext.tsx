import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePeriodizations } from '@/hooks/usePeriodizations';
import type { Periodization } from '@/types/periodization';
import {
  newPeriodization,
  type PeriodizationDraft,
} from './periodizationDraft';

type PeriodizationDesignContextValue = {
  periodizations: Periodization[];
  draft: PeriodizationDraft | null;
  createDraft: () => void;
  editDraft: (periodization: Periodization) => void;
  updateDraft: (draft: PeriodizationDraft) => void;
  saveDraft: () => boolean;
  cancelDraft: () => void;
};

const PeriodizationDesignContext =
  createContext<PeriodizationDesignContextValue | null>(null);

type PeriodizationDesignProviderProps = {
  children: ReactNode;
};

export function PeriodizationDesignProvider({
  children,
}: PeriodizationDesignProviderProps) {
  const { periodizations, savePeriodization } = usePeriodizations();
  const [draft, setDraft] = useState<PeriodizationDraft | null>(null);

  const value = useMemo<PeriodizationDesignContextValue>(
    () => ({
      periodizations,
      draft,
      createDraft: () => setDraft(newPeriodization()),
      editDraft: setDraft,
      updateDraft: setDraft,
      saveDraft: () => {
        if (!draft?.name.trim()) {
          return false;
        }
        savePeriodization(draft);
        setDraft(null);
        return true;
      },
      cancelDraft: () => setDraft(null),
    }),
    [draft, periodizations, savePeriodization],
  );

  return (
    <PeriodizationDesignContext.Provider value={value}>
      {children}
    </PeriodizationDesignContext.Provider>
  );
}

export function usePeriodizationDesign(): PeriodizationDesignContextValue {
  const value = useContext(PeriodizationDesignContext);
  if (!value) {
    throw new Error(
      'usePeriodizationDesign must be used inside PeriodizationDesignProvider',
    );
  }
  return value;
}
