import { View, Text, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/AppShell';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { widgetRegistry } from '@/components/widgets/registry';
import { useHomescreenStore } from '@/stores/homescreenStore';
import { colors } from '@/theme/tokens';
import type { WidgetType } from '@/types/widget';
import { WidgetPickerCard } from './components/WidgetPickerCard';

export function WidgetPickerScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const layout = useHomescreenStore(s => s.layout);
  const placedTypes = new Set(layout.map(w => w.type));

  const allTypes = Object.keys(widgetRegistry) as WidgetType[];

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
      <Text className="text-[15px] text-muted text-center px-10 mb-5">
        {t('widgetPicker.subtitle')}
      </Text>

      {/* Widget gallery */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-10"
      >
        {allTypes.map(type => (
          <WidgetPickerCard
            key={type}
            type={type}
            isPlaced={placedTypes.has(type)}
          />
        ))}
      </ScrollView>
    </AppShell>
  );
}
