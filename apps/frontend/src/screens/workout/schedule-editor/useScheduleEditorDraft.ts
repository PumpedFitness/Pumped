import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ScheduleRecurrenceType } from '@/data/local/enums';
import type { Schedule, SaveScheduleInput } from '@/types/schedule';

type ScheduleEditorDraft = {
  name: string;
  recurrenceType: ScheduleRecurrenceType;
  periodLength: number;
  isActive: boolean;
  anchorDay: number | null;
  // One workout per day slot, keyed by dayOffset within the rotation.
  slots: Record<number, string>;
  error: string | null;
};

type UseScheduleEditorDraftOptions = {
  schedule: Schedule | null;
  onSave: (input: SaveScheduleInput) => void;
  onSaved: () => void;
};

export function maxDayOffset(
  recurrenceType: ScheduleRecurrenceType,
  periodLength: number,
): number {
  return recurrenceType === 'WEEKLY' ? periodLength * 7 : periodLength;
}

function createInitialDraft(schedule: Schedule | null): ScheduleEditorDraft {
  const slots: Record<number, string> = {};
  for (const slot of schedule?.slots ?? []) {
    // First slot per day wins — the editor models one workout per day.
    if (slots[slot.dayOffset] === undefined) {
      slots[slot.dayOffset] = slot.workoutTemplateId;
    }
  }

  return {
    name: schedule?.name ?? '',
    recurrenceType: schedule?.recurrenceType ?? 'WEEKLY',
    periodLength: schedule?.periodLength ?? 1,
    isActive: schedule?.isActive ?? false,
    anchorDay: schedule?.anchorDay ?? null,
    slots,
    error: null,
  };
}

function pruneSlots(
  slots: Record<number, string>,
  recurrenceType: ScheduleRecurrenceType,
  periodLength: number,
): Record<number, string> {
  const limit = maxDayOffset(recurrenceType, periodLength);
  return Object.fromEntries(
    Object.entries(slots).filter(([offset]) => Number(offset) < limit),
  );
}

export function useScheduleEditorDraft({
  schedule,
  onSave,
  onSaved,
}: UseScheduleEditorDraftOptions) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<ScheduleEditorDraft>(() =>
    createInitialDraft(schedule),
  );

  const updateDraft = useCallback((update: Partial<ScheduleEditorDraft>) => {
    setDraft(current => ({ ...current, ...update, error: null }));
  }, []);

  // Day-offset semantics differ between modes, so clear placements on switch.
  const setRecurrenceType = useCallback(
    (recurrenceType: ScheduleRecurrenceType) => {
      setDraft(current => ({
        ...current,
        error: null,
        recurrenceType,
        slots: {},
      }));
    },
    [],
  );

  const setPeriodLength = useCallback((periodLength: number) => {
    setDraft(current => {
      const next = Math.max(1, periodLength);
      return {
        ...current,
        error: null,
        periodLength: next,
        slots: pruneSlots(current.slots, current.recurrenceType, next),
      };
    });
  }, []);

  const setSlot = useCallback(
    (dayOffset: number, workoutTemplateId: string | null) => {
      setDraft(current => {
        const slots = { ...current.slots };
        if (workoutTemplateId) {
          slots[dayOffset] = workoutTemplateId;
        } else {
          delete slots[dayOffset];
        }
        return { ...current, error: null, slots };
      });
    },
    [],
  );

  const save = useCallback(() => {
    if (!draft.name.trim()) {
      setDraft(current => ({
        ...current,
        error: t('schedule.errors.nameRequired'),
      }));
      return;
    }

    try {
      onSave({
        id: schedule?.id,
        name: draft.name.trim(),
        kind: 'ADVANCED',
        recurrenceType: draft.recurrenceType,
        periodLength: draft.periodLength,
        isActive: draft.isActive,
        anchorDay: draft.anchorDay ?? undefined,
        slots: Object.entries(draft.slots).map(
          ([offset, workoutTemplateId]) => ({
            dayOffset: Number(offset),
            workoutTemplateId,
          }),
        ),
      });
      onSaved();
    } catch (error) {
      setDraft(current => ({
        ...current,
        error:
          error instanceof Error
            ? error.message
            : t('schedule.errors.saveFailed'),
      }));
    }
  }, [draft, onSave, onSaved, schedule?.id, t]);

  return {
    draft,
    updateDraft,
    setRecurrenceType,
    setPeriodLength,
    setSlot,
    save,
  };
}
