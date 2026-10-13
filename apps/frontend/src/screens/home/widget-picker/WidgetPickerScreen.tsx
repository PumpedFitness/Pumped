import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { widgetGroups } from '@/components/widgets/registry';
import { useHomescreenStore } from '@/stores/homescreenStore';
import { WidgetGroupCard } from './components/WidgetGroupCard';

export function WidgetPickerScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const layout = useHomescreenStore(s => s.layout);
  const placedTypes = new Set(layout.map(widget => widget.type));

  return (
    <AppShell showTabBar={false} padTop padHorizontal={0}>
      <ScreenHeader
        title={t('widgetPicker.title')}
        subtitle={t('widgetPicker.subtitle')}
        onBack={() => navigation.goBack()}
        backAccessibilityLabel={t('common.back')}
      />

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
