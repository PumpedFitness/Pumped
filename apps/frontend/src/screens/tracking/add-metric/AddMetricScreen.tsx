import { useState, useRef, useEffect } from 'react';
import { View, type TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { randomUUID } from 'expo-crypto';
import type { InferInsertModel } from 'drizzle-orm';
import { ScreenHeader } from '@pumped/ui/clay/ScreenHeader';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { AddMetricHeader } from './components/AddMetricHeader';
import { MetricFormCard } from './components/MetricFormCard';
import { useRepository } from '@/data/local/useRepository';
import {
  bodyWeightEntries,
  bodyFatEntries,
} from '@/data/local/schema/bodyMetrics';
import { colors } from '@pumped/ui/theme/tokens';

type AddMetricRouteProp = RouteProp<RootStackParamList, 'AddMetric'>;

export function AddMetricScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<AddMetricRouteProp>();
  const { metric } = route.params;

  const table = metric === 'weight' ? bodyWeightEntries : bodyFatEntries;
  const repo = useRepository(table);
  const inputRef = useRef<TextInput>(null);

  const [value, setValue] = useState('');
  const [entryDate, setEntryDate] = useState(new Date());

  const title =
    metric === 'weight' ? t('metrics.weight') : t('metrics.bodyFat');
  const unit = metric === 'weight' ? 'kg' : '%';
  const iconName = metric === 'weight' ? 'scale' : 'percent';
  const placeholder =
    metric === 'weight'
      ? t('metrics.addPlaceholderWeight')
      : t('metrics.addPlaceholderBodyFat');

  useEffect(() => {
    const timeout = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(timeout);
  }, []);

  const handleSave = () => {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed <= 0) return;
    if (metric === 'bodyFat' && parsed > 100) return;

    repo.create({
      id: randomUUID(),
      value: parsed,
      recordedAt: entryDate.getTime(),
    } as InferInsertModel<typeof table>);

    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <AddMetricHeader
        onClose={() => navigation.goBack()}
        onSave={handleSave}
      />

      <View className="px-5 pb-4 pt-4">
        <ScreenHeader
          title={title}
          trailing={
            <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-sunk">
              <ClayIcon name={iconName} size={22} color={colors.accent} />
            </View>
          }
        />
      </View>

      <MetricFormCard
        value={value}
        onChangeValue={setValue}
        entryDate={entryDate}
        onChangeDate={setEntryDate}
        unit={unit}
        placeholder={placeholder}
        inputRef={inputRef}
        onSubmit={handleSave}
      />
    </View>
  );
}
