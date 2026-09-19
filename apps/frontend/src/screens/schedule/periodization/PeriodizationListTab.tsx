import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SearchableLibrary } from '@/components/layout/SearchableLibrary';
import { usePeriodizations } from '@/hooks/usePeriodizations';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { usePeriodizationDesign } from './PeriodizationDesignContext';
import { PeriodizationRow } from './PeriodizationRow';

export function PeriodizationListTab() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { createDraft, editDraft } = usePeriodizationDesign();
  const { periodizations, setActive } = usePeriodizations();

  const createPeriodization = () => {
    createDraft();
    navigation.navigate('PeriodizationEditor');
  };

  return (
    <SearchableLibrary
      items={periodizations}
      keyExtractor={item => item.id}
      getSearchText={item => item.name}
      renderItem={item => (
        <PeriodizationRow
          periodization={item}
          onEdit={() => {
            editDraft(item);
            navigation.navigate('PeriodizationEditor');
          }}
          onToggleActive={() => setActive(item.id, !item.isActive)}
        />
      )}
      namespace="schedule.periodization"
      createTestID="create_periodization"
      onCreate={createPeriodization}
    />
  );
}
