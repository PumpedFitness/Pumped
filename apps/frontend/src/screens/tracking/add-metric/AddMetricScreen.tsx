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
import { ModalHeader } from '@/components/layout/ModalHeader';
import { MetricFormCard } from './components/MetricFormCard';
import { useRepository } from '@/data/local/useRepository';
import {
  bodyWeightEntries,
  bodyFatEntries,
} from '@/data/local/schema/bodyMetrics';

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
      <ModalHeader
        title={title}
        rightLabel={t('common.save')}
        onLeftPress={() => navigation.goBack()}
        onRightPress={handleSave}
      />

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
