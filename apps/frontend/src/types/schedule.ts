import type { ScheduleKind, ScheduleRecurrenceType } from '@/data/local/enums';

export type ScheduleSlot = {
  id: string;
  dayOffset: number;
  position: number;
  workoutTemplateId: string;
};

export type Schedule = {
  id: string;
  userId: string;
  name: string;
  kind: ScheduleKind;
  recurrenceType: ScheduleRecurrenceType;
  periodLength: number;
  anchorDay: number;
  isActive: boolean;
  ownerTemplateId: string | null;
  slots: ScheduleSlot[];
  createdAt: number;
  updatedAt: number;
};

export type ScheduleSlotInput = {
  dayOffset: number;
  position?: number;
  workoutTemplateId: string;
};

export type SaveScheduleInput = {
  id?: string;
  name: string;
  kind: ScheduleKind;
  recurrenceType: ScheduleRecurrenceType;
  periodLength: number;
  anchorDay?: number;
  isActive?: boolean;
  ownerTemplateId?: string | null;
  slots: ScheduleSlotInput[];
};

// Workouts placed on a single local day. `templateIds` is ordered; an empty
// array means a rest day.
export type ResolvedDay = {
  dayIndex: number;
  templateIds: string[];
};
