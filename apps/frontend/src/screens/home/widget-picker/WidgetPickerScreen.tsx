import { View, Text, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/AppShell';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { widgetGroups } from '@/components/widgets/registry';
import { useHomescreenStore } from '@/stores/homescreenStore';
import { colors } from '@/theme/tokens';
import { WidgetGroupCard } from './components/WidgetGroupCard';

export function WidgetPickerScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const layout = useHomescreenStore(s => s.layout);
  const placedTypes = new Set(layout.map(widget => widget.type));

  return (
    <AppShell showTabBar={false} padTop padHorizontal={0}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pb-4 pt-2">
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <ClayIcon name="x" size={22} color={colors.ink} />
        </Pressable>
        <Text className="text-[17px] font-bold text-foreground">
          {t('widgetPicker.title')}
        </Text>
        <View className="w-[22px]" />
      </View>

      {/* Subtitle */}
      <Text className="mb-4 px-10 text-center text-[14px] text-muted">
        {t('widgetPicker.subtitle')}
      </Text>

      {/* Widget gallery */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-8"
      >
        {widgetGroups.map(({ group, variants }) => (
          <WidgetGroupCard
            key={group}
            variants={variants}
            placedTypes={placedTypes}
          />
        ))}
      </ScrollView>
    </AppShell>
  );
}
