import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { ScrollViewContainer } from 'react-native-reorderable-list';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/AppShell';
import { TabBarInsetSpacer } from '@/components/layout/TabBarInsetSpacer';
import { useUserProfile } from '@/hooks/useUserProfile';
import { IdentityRow } from './components/IdentityRow';
import { DisplayHeadline } from './components/DisplayHeadline';
import { NextSessionCard } from './components/NextSessionCard';
import { QuickActions, type QuickAction } from './components/QuickActions';
import {
  SummaryHeader,
  type SummaryRange,
} from './components/SummaryHeader';
import { ModuleGrid } from './components/ModuleGrid';
import { EditBanner } from './components/EditBanner';
import { AddModuleFooter } from './components/AddModuleFooter';
import { AddModuleSheet } from './components/AddModuleSheet';
import { ComputedFieldSheet } from './components/ComputedFieldSheet';
import { useHomeDashboard } from './useHomeDashboard';
import {
  buildFocusLine,
  buildHeadline,
  buildSessionMeta,
  formatDateLabel,
  initialsFromName,
} from './homePresenter';

const RANGE_OPTIONS: SummaryRange[] = ['daily', 'weekly', 'monthly'];
const CONTENT_STYLE = { paddingHorizontal: 18, paddingTop: 16 } as const;

export function HomeScreen() {
  const { t, i18n } = useTranslation();
  const { profile } = useUserProfile();
  const home = useHomeDashboard();
  const [range, setRange] = useState<SummaryRange>('weekly');

  const initials = initialsFromName(profile.name);
  const dateLabel = useMemo(
    () => formatDateLabel(i18n.language),
    [i18n.language],
  );
  const headline = buildHeadline(t, home.data.nextSession);
  const rangeOptions = RANGE_OPTIONS.map(value => ({
    value,
    label: t(`home.summary.${value}`),
  }));

  const quickActions: QuickAction[] = [
    {
      key: 'log',
      icon: 'dumbbell',
      label: t('home.quick.logLift'),
      onPress: home.startSession,
    },
    {
      key: 'timer',
      icon: 'clock',
      label: t('home.quick.timer'),
      onPress: home.openTimer,
    },
    {
      key: 'weigh',
      icon: 'scale',
      label: t('home.quick.weighIn'),
      onPress: home.openWeighIn,
    },
    {
      key: 'trends',
      icon: 'trend',
      label: t('home.quick.trends'),
      onPress: home.openTrends,
    },
  ];

  return (
    <AppShell showTabBar padTop={false}>
      <ScrollViewContainer
        showsVerticalScrollIndicator={false}
        contentContainerStyle={CONTENT_STYLE}
      >
        <IdentityRow
          initials={initials}
          dateLabel={dateLabel}
          blockStatus={t('home.blockStatus')}
          editing={home.editing}
          onToggleEdit={home.toggleEdit}
          editLabel={t('home.edit.editPill')}
          doneLabel={t('home.edit.donePill')}
        />

        <View className="mt-[26px]">
          <DisplayHeadline lead={headline.lead} subject={headline.subject} />
        </View>

        {home.data.nextSession ? (
          <View className="mt-[26px]">
            <NextSessionCard
              session={home.data.nextSession}
              labelNext={buildFocusLine(t, home.data.nextSession)}
              metaLine={buildSessionMeta(t, home.data.nextSession)}
              progressLabel={t('home.hero.blockProgress')}
              progressPercent={38}
              startA11y={t('home.hero.startA11y', {
                name: home.data.nextSession.name,
              })}
              onStart={home.startSession}
            />
          </View>
        ) : null}

        <View className="mt-[26px]">
          <QuickActions actions={quickActions} />
        </View>

        <View className="mt-[26px]">
          <SummaryHeader
            title={t('home.summary.title')}
            range={range}
            onChange={setRange}
            options={rangeOptions}
          />
        </View>

        <View className="mt-[16px] gap-[12px]">
          {home.editing ? (
            <EditBanner text={t('home.edit.banner')} />
          ) : null}

          <ModuleGrid
            modules={home.modules}
            data={home.data}
            computedFieldById={home.computedFieldById}
            editing={home.editing}
            onRemove={home.handleRemove}
            onToggleSpan={home.handleToggleSpan}
            onReorder={home.handleReorder}
            onOpenTrends={home.openTrends}
          />

          {home.editing ? (
            <AddModuleFooter
              label={t('home.edit.addModule')}
              onPress={home.openAddSheet}
            />
          ) : null}
        </View>

        <TabBarInsetSpacer />
      </ScrollViewContainer>

      <AddModuleSheet
        visible={home.sheet === 'add'}
        hiddenKinds={home.hiddenKinds}
        onClose={home.closeSheet}
        onAdd={home.handleAddModule}
        onBuildComputed={home.openComputedSheet}
      />
      <ComputedFieldSheet
        visible={home.sheet === 'computed'}
        onClose={home.closeSheet}
        onAdd={home.handleAddComputed}
      />
    </AppShell>
  );
}
