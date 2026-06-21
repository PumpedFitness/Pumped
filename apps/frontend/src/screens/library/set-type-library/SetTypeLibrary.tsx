import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@/theme/tokens';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { ClayIcon, type IconName } from '@/components/icons/ClayIcon';
import { SwipeToDelete } from '@/components/clay/SwipeToDelete';
import { SearchableLibrary } from '@/components/layout/SearchableLibrary';
import { useSetTypeLibrary } from '@/hooks/useSetTypeLibrary';
import type { SetTypeWithFields } from '@/types/setType';

type SetTypeRowProps = {
  type: SetTypeWithFields;
  onPress: () => void;
};

function SetTypeRow({ type, onPress }: SetTypeRowProps) {
  const { t } = useTranslation();
  const summary = type.fields.length
    ? type.fields.map(field => field.name).join(' · ')
    : t('setTypeLibrary.noFields');

  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center gap-3 rounded-[18px] border border-border-soft bg-surface-card px-4 py-3 active:bg-surface-sunk"
      onPress={onPress}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-sunk">
        <ClayIcon
          name={(type.icon as IconName) ?? 'target'}
          size={18}
          color={colors.ink2}
        />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="t-label text-foreground" numberOfLines={1}>
            {type.name}
          </Text>
          {type.isBuiltIn && (
            <Text className="t-eyebrow rounded-full bg-surface-sunk px-2 py-0.5 text-muted">
              {t('setTypeLibrary.builtIn')}
            </Text>
          )}
        </View>
        <Text className="t-caption mt-0.5" numberOfLines={1}>
          {summary}
        </Text>
      </View>
      <ClayIcon name="chevron" size={16} color={colors.muted} />
    </Pressable>
  );
}

export function SetTypeLibrary() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { items, deleteSetType } = useSetTypeLibrary();

  const openEditor = (setTypeId?: string) =>
    navigation.navigate('SetTypeEditor', setTypeId ? { setTypeId } : {});

  const renderRow = (type: SetTypeWithFields) => {
    const row = <SetTypeRow type={type} onPress={() => openEditor(type.id)} />;
    // Built-ins can be edited but not deleted, so only custom types swipe away.
    return type.isBuiltIn ? (
      row
    ) : (
      <SwipeToDelete onDelete={() => deleteSetType(type.id)}>
        {row}
      </SwipeToDelete>
    );
  };

  return (
    <SearchableLibrary
      items={items}
      keyExtractor={type => type.id}
      getSearchText={type =>
        [type.name, ...type.fields.map(field => field.name)].join(' ')
      }
      renderItem={renderRow}
      namespace="setTypeLibrary"
      emptyIconName="dumbbell"
      stickySearch
      itemGap={8}
      createTestID="create_set_type"
      onCreate={() => openEditor()}
    />
  );
}
