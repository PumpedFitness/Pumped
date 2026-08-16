import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { shadows, colors } from '@pumped/ui/theme/tokens';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { ClayIcon, type IconName } from '@pumped/ui/icons/ClayIcon';
import { SwipeToDelete } from '@pumped/ui/clay/SwipeToDelete';
import { SearchableLibrary } from '@/components/layout/SearchableLibrary';
import { useSetTypeLibrary } from '@/hooks/useSetTypeLibrary';
import type { SetTypeWithFields } from '@/types/setType';
import { IndexRowChevron } from '../components/IndexRowChevron';

type SetTypeRowProps = {
  type: SetTypeWithFields;
  // Built-ins are display-only, so they pass no handler and render as a
  // non-interactive row (no chevron, no press feedback).
  onPress?: () => void;
};

// v2 index row: radius 24, padding 18, surface-card, row shadow.
const ROW_CLASS =
  'flex-row items-center gap-[13px] overflow-hidden rounded-[24px] bg-surface-card p-[18px]';

function SetTypeRow({ type, onPress }: SetTypeRowProps) {
  const { t } = useTranslation();
  const summary = type.fields.length
    ? type.fields.map(field => field.name).join(' · ')
    : t('setTypeLibrary.noFields');

  const content = (
    <>
      <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-sunk">
        <ClayIcon
          name={(type.icon as IconName) ?? 'target'}
          size={18}
          color={colors.ink2}
        />
      </View>
      <View className="flex-1 gap-[7px]">
        <View className="flex-row items-center gap-2">
          <Text
            className="text-[16px] font-bold text-foreground leading-[1.25]"
            numberOfLines={1}
          >
            {type.name}
          </Text>
          {type.isBuiltIn && (
            <Text className="t-eyebrow rounded-full bg-surface-sunk px-2 py-0.5 text-muted">
              {t('setTypeLibrary.builtIn')}
            </Text>
          )}
        </View>
        <Text
          className="text-[12px] font-medium text-muted leading-[1.4]"
          numberOfLines={1}
        >
          {summary}
        </Text>
      </View>
      {onPress ? <IndexRowChevron /> : null}
    </>
  );

  if (!onPress) {
    return (
      <View className={ROW_CLASS} style={shadows.row}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      className={`${ROW_CLASS} active:bg-surface-sunk`}
      style={shadows.row}
      onPress={onPress}
    >
      {content}
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
      <SwipeToDelete onDelete={() => deleteSetType(type.id)} borderRadius={24}>
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
      stickySearch
      itemGap={10}
      createTestID="create_set_type"
      onCreate={() => openEditor()}
    />
  );
}
