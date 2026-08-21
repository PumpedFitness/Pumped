import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ExerciseSectionState } from '@/components/exercise/ExerciseSectionHeader';
import { SessionBlockBand } from './SessionBlockBand';

// Primitives only, so the band memoizes: the block object is rebuilt on every
// set edit, and taking it directly would re-render this on every keystroke.
type SessionSupersetHeaderProps = {
  index: number;
  title: string;
  currentRound: number;
  rounds: number;
  state: ExerciseSectionState;
};

/**
 * The band that pins above a whole superset. Same band as a single exercise,
 * but eyebrowed and counted differently: a superset names its members on one
 * line and counts its progress in rounds, not in sets. The swap glyph is the
 * one mark that survives at a glance — it says "these alternate" before you
 * have read a word.
 */
export const SessionSupersetHeader = memo(function SessionSupersetHeader({
  index,
  title,
  currentRound,
  rounds,
  state,
}: SessionSupersetHeaderProps) {
  const { t } = useTranslation();

  return (
    <SessionBlockBand
      index={index}
      title={title}
      eyebrow={t('currentWorkout.superset.eyebrow')}
      eyebrowIcon="swap"
      statusLabel={t('currentWorkout.superset.round', {
        current: currentRound,
        total: rounds,
      })}
      state={state}
    />
  );
});
