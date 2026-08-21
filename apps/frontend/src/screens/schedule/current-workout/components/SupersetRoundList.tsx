import { Fragment } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import type {
  CurrentWorkoutExercise,
  UpdateCurrentWorkoutSetInput,
} from '@/stores/currentWorkoutModel';
import type { SetTypeWithFields } from '@/types/setType';
import { useProgressionSuggestions } from '@/hooks/useProgressionSuggestion';
import {
  ExerciseSetTable,
  type SetTypeOption,
} from '@/components/exercise/set-table';
import { colors } from '@pumped/ui/theme/tokens';
import { alpha } from '@pumped/ui/theme/palette';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { effectiveTemplateExercise } from './sessionTemplateExercise';
import { requestRemoveSet } from './currentWorkoutConfirm';
import type { SessionSupersetBlock } from './sessionBlocks';

type SupersetRoundListProps = {
  block: SessionSupersetBlock;
  nameFor: (exerciseId: string) => string;
  weightUnit: WeightUnit;
  setTypeOptions: SetTypeOption[];
  setTypesById: Map<string, SetTypeWithFields>;
  onCreateSetType: (name: string) => string;
  updateSet: (
    exerciseId: string,
    setId: string,
    values: UpdateCurrentWorkoutSetInput,
  ) => void;
  toggleSetDone: (exerciseId: string, setId: string) => boolean;
  onSetLogged: (restSeconds: number, sourceSetId?: string) => void;
  activeRestSetId: string | null;
  removeSet: (exerciseId: string, setId: string) => void;
};

// Members are lettered the way a coach writes them down: A then B, alternating
// inside every round. More than this many members is not a superset any more.
const MEMBER_LETTERS = 'ABCDEFGH';

/**
 * A round's surface is deliberately neutral. Tinting it accent as well made a
 * superset three shades of orange deep — band, wash, chips — and the containment
 * is doing the work here, not the colour. Accent is spent on exactly one thing
 * per round: the chip that says which round you are on.
 */
function roundSurface(isDone: boolean) {
  if (isDone) {
    return {
      backgroundColor: alpha(colors.ink, 0.035),
      borderColor: colors.lineSoft,
    };
  }
  return { backgroundColor: colors.cardSunk, borderColor: colors.line };
}

type RoundHeaderProps = {
  label: string;
  isCurrent: boolean;
  isDone: boolean;
};

function RoundHeader({ label, isCurrent, isDone }: RoundHeaderProps) {
  return (
    <View className="flex-row items-center gap-2">
      <View
        className="rounded-full px-2.5 py-[3px]"
        style={{ backgroundColor: isCurrent ? colors.accent : colors.card }}
      >
        <Text
          className="t-eyebrow"
          style={{ color: isCurrent ? colors.cream : colors.muted }}
        >
          {label}
        </Text>
      </View>
      <View className="h-px flex-1 rounded-full bg-border-hairline" />
      {isDone ? (
        <View className="h-[18px] w-[18px] items-center justify-center rounded-full bg-moss">
          <ClayIcon name="check" size={11} color={colors.cream} />
        </View>
      ) : null}
    </View>
  );
}

type MemberLabelProps = {
  letter: string;
  name: string;
  isCurrent: boolean;
};

function MemberLabel({ letter, name, isCurrent }: MemberLabelProps) {
  return (
    <View className="flex-row items-center gap-2">
      <View
        className="h-[19px] w-[19px] items-center justify-center rounded-[7px]"
        style={{ backgroundColor: isCurrent ? colors.accent : colors.card }}
      >
        <Text
          className="text-[10.5px] font-black"
          style={{ color: isCurrent ? colors.cream : colors.muted }}
        >
          {letter}
        </Text>
      </View>
      <Text
        className="t-label min-w-0 flex-1"
        numberOfLines={1}
        style={{ color: isCurrent ? colors.ink : colors.muted }}
      >
        {name}
      </Text>
    </View>
  );
}

/**
 * The tie between two members of a round. Drawn under the letter badge so the
 * exercises read as one chain rather than as two lists that happen to sit near
 * each other — and captioned when there is no rest in between, which is the
 * whole point of supersetting them.
 */
function MemberLink({ hint }: { hint: string | null }) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="w-[19px] items-center">
        <View className="h-3.5 w-[2px] rounded-full bg-border-hairline" />
      </View>
      {hint ? (
        <Text className="text-[11px] font-semibold text-muted">{hint}</Text>
      ) : null}
    </View>
  );
}

/**
 * A superset in the order you actually perform it: round by round, one set of
 * every exercise before the next round starts. Rendering member-by-member
 * instead would put all of Pull-Up's sets above all of Dip's, which is the
 * opposite of what a superset is.
 *
 * Each round is its own tinted card for the same reason — the unit of work here
 * is the round, not the exercise, and the card is what makes that visible once
 * you have scrolled past the header band.
 */
export function SupersetRoundList({
  block,
  nameFor,
  weightUnit,
  setTypeOptions,
  setTypesById,
  onCreateSetType,
  updateSet,
  toggleSetDone,
  onSetLogged,
  activeRestSetId,
  removeSet,
}: SupersetRoundListProps) {
  const { t } = useTranslation();
  // One call for every member: a hook cannot run once per member from here,
  // and the history only has to be read once this way.
  const suggestions = useProgressionSuggestions(
    block.exercises.map(exercise => ({
      exerciseId: exercise.exerciseId,
      templateExercise: effectiveTemplateExercise(exercise),
    })),
  );

  // Captures the set's pre-toggle state so we know it became done (not undone)
  // and what rest it carries — the toggle itself only returns a success flag.
  const logSet = (exercise: CurrentWorkoutExercise, setId: string) => {
    const set = exercise.sets.find(item => item.id === setId);
    const wasDone = set?.isDone ?? false;
    const ok = toggleSetDone(exercise.id, setId);
    if (ok && !wasDone && set?.restSeconds && set.restSeconds > 0) {
      onSetLogged(set.restSeconds, set.id);
    }
    return ok;
  };

  return (
    <View className="gap-3">
      {Array.from({ length: block.rounds }, (_, round) => {
        const isCurrentRound = block.currentRound === round + 1;
        const isDoneRound = block.exercises.every(
          exercise => exercise.sets[round]?.isDone ?? true,
        );

        return (
          <View
            key={`round-${round}`}
            className="gap-2.5 rounded-[22px] border p-2.5"
            style={roundSurface(isDoneRound)}
          >
            <RoundHeader
              label={t('currentWorkout.superset.roundLabel', {
                round: round + 1,
              })}
              isCurrent={isCurrentRound}
              isDone={isDoneRound}
            />

            {block.exercises.map((exercise, memberIndex) => {
              const set = exercise.sets[round];
              if (!set) {
                return null;
              }
              const isCurrent = set.id === block.currentSetId;
              const isLastMember = memberIndex === block.exercises.length - 1;

              return (
                <Fragment key={`${exercise.id}-${round}`}>
                  <View className="gap-1.5">
                    <MemberLabel
                      letter={MEMBER_LETTERS[memberIndex] ?? '?'}
                      name={nameFor(exercise.exerciseId)}
                      isCurrent={isCurrent}
                    />

                    <ExerciseSetTable
                      sets={[set]}
                      suggestedSets={
                        suggestions
                          .get(exercise.exerciseId)
                          ?.suggestedSets.slice(round, round + 1) ?? []
                      }
                      indexOffset={round}
                      currentSetId={block.currentSetId}
                      canRemoveSets={block.rounds > 1}
                      setTypeOptions={setTypeOptions}
                      setTypesById={setTypesById}
                      weightUnit={weightUnit}
                      activeRestSetId={activeRestSetId}
                      animateLayout={false}
                      iconOnlySetType
                      onCreateSetType={onCreateSetType}
                      onChangeSet={(setId, values) =>
                        updateSet(exercise.id, setId, values)
                      }
                      onToggleSetDone={setId => logSet(exercise, setId)}
                      onRemoveSet={target =>
                        requestRemoveSet(
                          t,
                          exercise,
                          target,
                          removeSet,
                          block.exercises.length,
                        )
                      }
                    />
                  </View>

                  {isLastMember ? null : (
                    <MemberLink
                      hint={
                        set.restSeconds
                          ? null
                          : t('currentWorkout.superset.straightInto')
                      }
                    />
                  )}
                </Fragment>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}
