import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { AppShell } from '@/components/layout/AppShell';
import { TabBarInsetSpacer } from '@/components/layout/TabBarInsetSpacer';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';
import { useHomescreenStore } from '@/stores/homescreenStore';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSetTypeLibrary } from '@/hooks/useSetTypeLibrary';
import { ExerciseSetTable } from '@/components/exercise/set-table';
import type { ReadOnlyExerciseSet } from '@/components/exercise/set-table/exerciseSetTableModel';

function getDayGreeting(t: TFunction, language: string): string {
  const now = new Date();
  const hour = now.getHours();
  let timeOfDay: string;
  if (hour < 12) timeOfDay = t('home.timeOfDay.morning');
  else if (hour < 17) timeOfDay = t('home.timeOfDay.afternoon');
  else timeOfDay = t('home.timeOfDay.evening');

  const day = now.toLocaleDateString(language, { weekday: 'long' });

  return t('home.dayGreeting', { day, timeOfDay });
}

function ExerciseSetTableDemo() {
  const { options: setTypeOptions, byId: setTypesById } = useSetTypeLibrary();

  let demoTypeId: string | undefined;
  let weightFieldId: string | undefined;
  let repsFieldId: string | undefined;

  for (const type of setTypesById.values()) {
    const weightField = type.fields.find(f => f.unit === 'amount');
    const repsField = type.fields.find(
      f => f.dataType === 'number' && f.unit == null,
    );
    if (weightField || repsField) {
      demoTypeId = type.id;
      weightFieldId = weightField?.id;
      repsFieldId = repsField?.id;
      break;
    }
  }

  if (!demoTypeId) return null;

  const makeSet = (
    id: string,
    reps: number,
    weightKg: number,
  ): ReadOnlyExerciseSet => ({
    id,
    setType: demoTypeId as string,
    restSeconds: null,
    fieldDefinitions: [],
    fieldValues: [
      ...(repsFieldId ? [{ fieldId: repsFieldId, number: reps }] : []),
      ...(weightFieldId ? [{ fieldId: weightFieldId, number: weightKg }] : []),
    ],
  });

  return (
    <View className="mt-6 gap-6">
      <View className="gap-2">
        <Text className="text-[12px] font-bold uppercase tracking-[0.8px] text-muted px-5">
          Set delta demo
        </Text>
        <View className="px-5">
          <ExerciseSetTable
            readOnly
            sets={[makeSet('demo-a', 8, 80), makeSet('demo-b', 7, 80)]}
            previousSets={[makeSet('prev-a', 7, 77.5), makeSet('prev-b', 8, 80)]}
            setTypeOptions={setTypeOptions}
            setTypesById={setTypesById}
            weightUnit="kg"
          />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-[12px] font-bold uppercase tracking-[0.8px] text-muted px-5">
          Additional set demo
        </Text>
        <View className="px-5">
          <ExerciseSetTable
            readOnly
            sets={[
              makeSet('demo-x', 8, 80),
              makeSet('demo-y', 8, 80),
              makeSet('demo-z', 8, 80),
              makeSet('demo-w', 8, 82.5),
            ]}
            previousSets={[
              makeSet('prev-x', 8, 77.5),
              makeSet('prev-y', 7, 77.5),
              makeSet('prev-z', 8, 77.5),
            ]}
            setTypeOptions={setTypeOptions}
            setTypesById={setTypesById}
            weightUnit="kg"
          />
        </View>
      </View>
    </View>
  );
}

export function HomeScreen() {
  const { t, i18n } = useTranslation();
  const layout = useHomescreenStore(s => s.layout);
  const { profile } = useUserProfile();

  const timeLabel = getDayGreeting(t, i18n.language);
  const greeting = profile.name
    ? t('home.greeting', { name: profile.name })
    : t('home.greetingNoName');

  return (
    <AppShell showTabBar padTop={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-6"
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-5">
          <Text className="text-[12.5px] text-muted font-medium mb-1">
            {timeLabel}
          </Text>
          <Text className="text-[30px] font-bold text-foreground tracking-[-0.5px]">
            {greeting}
          </Text>
        </View>

        {/* Widget Grid */}
        <View className="px-5">
          <WidgetGrid layout={layout} />
        </View>

        <ExerciseSetTableDemo />

        <TabBarInsetSpacer />
      </ScrollView>
    </AppShell>
  );
}
