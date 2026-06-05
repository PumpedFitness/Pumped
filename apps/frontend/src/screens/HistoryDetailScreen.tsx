import { useMemo } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { eq, asc } from 'drizzle-orm';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { AppView } from '../components/AppView';
import { AppBar } from '../components/AppBar';
import { IconButton, Icons, SvgIcon } from '../components/IconButton';
import { Stat } from '../components/Stat';
import { colors } from '../theme/tokens';
import { useRepository } from '../data/local/useRepository';
import {
  workoutSessions,
  workoutSessionSets,
  exercises as exerciseTable,
} from '../data/local/schema';
import type { WorkoutSessionSet } from '../types/domain';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ts: number): string {
  const d = new Date(ts);
  const day = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const month = d
    .toLocaleDateString('en-US', { month: 'short' })
    .toUpperCase();
  const date = d.getDate();
  return `${day} · ${month} ${date}`;
}

function formatDuration(startMs: number, endMs: number): string {
  const diff = Math.floor((endMs - startMs) / 1000);
  const m = Math.floor(diff / 60);
  const s = String(diff % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type ExerciseSummaryProps = {
  name: string;
  order: number;
  sets: WorkoutSessionSet[];
};

function ExerciseSummary({ name, order, sets }: ExerciseSummaryProps) {
  const totalVolume = sets.reduce(
    (sum, s) => sum + (s.weight ?? 0) * s.reps,
    0,
  );

  return (
    <View className="rounded-md overflow-hidden bg-surface-raised border border-border">
      <View className="p-3 px-3.5 flex-row items-center justify-between border-b border-border-soft">
        <View className="flex-row items-center gap-2.5">
          <View className="w-7 h-7 rounded-sm items-center justify-center border border-border">
            <Text className="mono-sm text-muted">{order}</Text>
          </View>
          <View>
            <Text className="text-[15px] font-semibold text-foreground">
              {name}
            </Text>
            <Text className="body-sub font-mono mt-0.5">
              {sets.length} sets · {totalVolume.toLocaleString()} lb total
            </Text>
          </View>
        </View>
      </View>
      <View className="p-2 px-3 pb-3">
        {sets.map((s, i) => (
          <View
            key={s.id}
            className={`flex-row items-center gap-2 p-2 ${i > 0 ? 'mt-1' : ''}`}
          >
            <Text className="w-8 mono-sm text-muted">{i + 1}</Text>
            <View className="flex-1 flex-row items-baseline gap-1">
              <Text className="mono-value">{s.weight ?? 0}</Text>
              <Text className="eyebrow">lb</Text>
            </View>
            <View className="flex-1 flex-row items-baseline gap-1">
              <Text className="mono-value">{s.reps}</Text>
              <Text className="eyebrow">reps</Text>
            </View>
            <SvgIcon d={Icons.check} size={16} color={colors.textMuted} />
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function HistoryDetailScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'HistoryDetail'>>();
  const { sessionId } = route.params;

  // ── Typed repos straight from the schema ───────────────────────────────────

  const sessionRepo = useRepository(workoutSessions);
  const setRepo = useRepository(workoutSessionSets);
  const exerciseRepo = useRepository(exerciseTable);

  // ── Read ───────────────────────────────────────────────────────────────────

  const session = sessionRepo.getById(sessionId);
  const sets = setRepo.query({
    where: eq(workoutSessionSets.workoutSessionId, sessionId),
    orderBy: [asc(workoutSessionSets.setIndex)],
  });

  // ── Derive ─────────────────────────────────────────────────────────────────

  const exerciseGroups = useMemo(() => {
    const groups = new Map<string, WorkoutSessionSet[]>();
    for (const set of sets) {
      const existing = groups.get(set.exerciseId) ?? [];
      existing.push(set);
      groups.set(set.exerciseId, existing);
    }
    return Array.from(groups.entries()).map(([exerciseId, groupSets]) => ({
      exerciseId,
      name: exerciseRepo.getById(exerciseId)?.name ?? 'Unknown Exercise',
      sets: groupSets,
    }));
  }, [sets, exerciseRepo]);

  const totalSets = sets.length;
  const totalVolume = sets.reduce(
    (sum, s) => sum + (s.weight ?? 0) * s.reps,
    0,
  );
  const duration =
    session?.startedAt && session?.endedAt
      ? formatDuration(session.startedAt, session.endedAt)
      : '--:--';

  // ── Write ──────────────────────────────────────────────────────────────────

  function handleDelete() {
    Alert.alert('Delete Workout', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          sessionRepo.deleteById(sessionId);
          navigation.goBack();
        },
      },
    ]);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!session) {
    return (
      <AppView>
        <AppBar
          title="Workout"
          leading={
            <IconButton
              icon={Icons.arrowLeft}
              label="Back"
              onPress={() => navigation.goBack()}
            />
          }
        />
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">Session not found</Text>
        </View>
      </AppView>
    );
  }

  return (
    <AppView>
      <AppBar
        title={session.name}
        eyebrow={formatDate(session.startedAt)}
        leading={
          <IconButton
            icon={Icons.arrowLeft}
            label="Back"
            onPress={() => navigation.goBack()}
          />
        }
        trailing={
          <IconButton
            icon={Icons.more}
            label="More"
            onPress={handleDelete}
          />
        }
      />

      <ScrollView className="flex-1 px-4 pt-4">
        <View className="flex-row rounded-sm overflow-hidden mb-5 border border-border">
          {[
            { label: 'Duration', value: duration },
            { label: 'Volume', value: totalVolume.toLocaleString() },
            { label: 'Sets', value: String(totalSets) },
          ].map((s, i) => (
            <View
              key={s.label}
              className={`flex-1 p-3.5 px-3 bg-surface-raised ${
                i > 0 ? 'border-l border-border' : ''
              }`}
            >
              <Stat label={s.label} value={s.value} />
            </View>
          ))}
        </View>

        <View className="gap-3.5">
          {exerciseGroups.map((group, i) => (
            <ExerciseSummary
              key={group.exerciseId}
              name={group.name}
              order={i + 1}
              sets={group.sets}
            />
          ))}
        </View>

        {session.notes ? (
          <View className="mt-5 p-3 px-3.5 rounded-sm mb-6 border border-dashed border-border-strong">
            <Text className="eyebrow mb-1.5">Notes</Text>
            <Text className="text-sm text-foreground-secondary leading-relaxed">
              {session.notes}
            </Text>
          </View>
        ) : (
          <View className="h-6" />
        )}
      </ScrollView>
    </AppView>
  );
}
