import { useState, useRef, useEffect } from 'react';
import { View, Text, type TextInput } from 'react-native';
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
import { ClayIcon } from '@/components/icons/ClayIcon';
import { AddMetricHeader } from './components/AddMetricHeader';
import { MetricFormCard } from './components/MetricFormCard';
import { useRepository } from '@/data/local/useRepository';
import {
  bodyWeightEntries,
  bodyFatEntries,
} from '@/data/local/schema/bodyMetrics';
import { colors } from '@/theme/tokens';

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

      {/* Icon + Title */}
      <View className="items-center mt-8">
        <View className="w-20 h-20 rounded-full bg-surface-sunk items-center justify-center">
          <ClayIcon name={iconName} size={36} color={colors.accent} />
        </View>
        <Text className="text-[21px] font-bold text-foreground mt-3">
          {title}
        </Text>
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
