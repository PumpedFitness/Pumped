import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';
import {
  DoneMark,
  RestStateBox,
  SetNumber,
  TopbarCore,
} from './RestTimerTopbarMockupParts';

type RestTimerMockupVariant =
  | 'statusBlock'
  | 'restRail'
  | 'cornerTab'
  | 'tileBar'
  | 'idleSlot';

type RestTimerMockup = {
  variant: RestTimerMockupVariant;
  title: string;
  restLabel: string;
  setTypeLabel: string;
  progressionLabel: string;
  runningLabel: string;
  idleLabel: string;
};

function StatusBlockMockup({
  title,
  restLabel,
  setTypeLabel,
  progressionLabel,
  runningLabel,
}: RestTimerMockup) {
  return (
    <View className="gap-2 rounded-[18px] border border-border-soft bg-surface-card p-3">
      <Text className="text-[11px] font-bold uppercase tracking-[0.6px] text-muted">
        {title}
      </Text>
      <View className="flex-row items-center gap-3">
        <SetNumber />
        <TopbarCore
          setTypeLabel={setTypeLabel}
          progressionLabel={progressionLabel}
        />
        <RestStateBox restLabel={restLabel} stateLabel={runningLabel} running />
        <DoneMark />
      </View>
    </View>
  );
}

function RestRailMockup({
  title,
  restLabel,
  setTypeLabel,
  progressionLabel,
  runningLabel,
}: RestTimerMockup) {
  return (
    <View className="gap-2 rounded-[18px] border border-border-soft bg-surface-card p-3">
      <Text className="text-[11px] font-bold uppercase tracking-[0.6px] text-muted">
        {title}
      </Text>
      <View className="flex-row items-stretch overflow-hidden rounded-[14px] border border-border-soft bg-background">
        <View className="min-w-0 flex-1 flex-row items-center gap-2 px-2.5 py-2">
          <SetNumber />
          <TopbarCore
            setTypeLabel={setTypeLabel}
            progressionLabel={progressionLabel}
          />
        </View>
        <View className="w-px bg-border-soft" />
        <View className="w-[68px] items-center justify-center bg-accent-soft">
          <View className="flex-row items-center gap-1">
            <ClayIcon name="rest" size={13} color={colors.accent} />
            <View className="h-1.5 w-1.5 rounded-full bg-accent" />
          </View>
          <Text className="mt-0.5 text-[11px] font-black tabular-nums text-accent">
            {restLabel}
          </Text>
          <Text className="text-[8px] font-black uppercase tracking-[0.4px] text-accent">
            {runningLabel}
          </Text>
        </View>
        <View className="w-px bg-border-soft" />
        <View className="w-12 items-center justify-center">
          <DoneMark square />
        </View>
      </View>
    </View>
  );
}

function CornerTabMockup({
  title,
  restLabel,
  setTypeLabel,
  progressionLabel,
  runningLabel,
}: RestTimerMockup) {
  return (
    <View className="rounded-[18px] border border-border-soft bg-surface-card p-3">
      <Text className="mb-2 text-[11px] font-bold uppercase tracking-[0.6px] text-muted">
        {title}
      </Text>
      <View className="flex-row items-center gap-2">
        <SetNumber />
        <TopbarCore
          setTypeLabel={setTypeLabel}
          progressionLabel={progressionLabel}
        />
        <View className="items-end rounded-[12px] bg-surface-sunk px-2.5 py-1.5">
          <View className="flex-row items-center gap-1">
            <ClayIcon name="rest" size={13} color={colors.accent} />
            <View className="h-1.5 w-1.5 rounded-full bg-accent" />
          </View>
          <Text className="text-[13px] font-black tabular-nums text-foreground">
            {restLabel}
          </Text>
          <Text className="text-[8px] font-black uppercase tracking-[0.4px] text-accent">
            {runningLabel}
          </Text>
        </View>
        <DoneMark />
      </View>
    </View>
  );
}

function TileBarMockup({
  title,
  restLabel,
  setTypeLabel,
  progressionLabel,
}: RestTimerMockup) {
  return (
    <View
      className="gap-2 rounded-[18px] border p-3"
      style={{ backgroundColor: colors.ink, borderColor: colors.ink }}
    >
      <Text
        className="text-[11px] font-bold uppercase tracking-[0.6px]"
        style={{ color: colors.creamDim }}
      >
        {title}
      </Text>
      <View className="flex-row items-stretch gap-1.5">
        <View
          className="w-9 items-center justify-center rounded-[12px]"
          style={{ backgroundColor: colors.lineOnMoss }}
        >
          <Text className="text-[12px] font-black tabular-nums text-cream">
            2
          </Text>
        </View>
        <View
          className="min-w-0 flex-1 justify-center rounded-[12px] px-2.5"
          style={{ backgroundColor: colors.lineOnMoss }}
        >
          <TopbarCore
            setTypeLabel={setTypeLabel}
            progressionLabel={progressionLabel}
            inverted
          />
        </View>
        <View className="w-[68px] rounded-[12px] bg-accent px-2 py-1.5">
          <View className="flex-row items-center justify-between">
            <ClayIcon name="rest" size={12} color={colors.cream} />
            <View className="h-1.5 w-1.5 rounded-full bg-cream" />
          </View>
          <Text className="mt-1 text-[13px] font-black tabular-nums text-cream">
            {restLabel}
          </Text>
        </View>
        <DoneMark inverted />
      </View>
    </View>
  );
}

function IdleSlotMockup({
  title,
  restLabel,
  setTypeLabel,
  progressionLabel,
  idleLabel,
}: RestTimerMockup) {
  return (
    <View className="gap-2 rounded-[18px] border border-border-soft bg-surface-card p-3">
      <Text className="text-[11px] font-bold uppercase tracking-[0.6px] text-muted">
        {title}
      </Text>
      <View className="flex-row items-center gap-2">
        <SetNumber />
        <View className="min-w-0 flex-1">
          <TopbarCore
            setTypeLabel={setTypeLabel}
            progressionLabel={progressionLabel}
          />
        </View>
        <RestStateBox restLabel={restLabel} stateLabel={idleLabel} compact />
        <DoneMark checked square />
      </View>
    </View>
  );
}

function MockSetTopbar(props: RestTimerMockup) {
  if (props.variant === 'statusBlock') return <StatusBlockMockup {...props} />;
  if (props.variant === 'restRail') return <RestRailMockup {...props} />;
  if (props.variant === 'cornerTab') return <CornerTabMockup {...props} />;
  if (props.variant === 'tileBar') return <TileBarMockup {...props} />;
  return <IdleSlotMockup {...props} />;
}

export function RestTimerTopbarMockups() {
  const { t } = useTranslation();
  const sharedLabels = {
    setTypeLabel: t('home.restTimerMockups.setType'),
    progressionLabel: t('home.restTimerMockups.progression'),
    runningLabel: t('home.restTimerMockups.running'),
    idleLabel: t('home.restTimerMockups.idle'),
  };
  const variants: RestTimerMockup[] = [
    {
      variant: 'statusBlock',
      title: t('home.restTimerMockups.variants.statusBlock'),
      restLabel: '90s',
      ...sharedLabels,
    },
    {
      variant: 'restRail',
      title: t('home.restTimerMockups.variants.restRail'),
      restLabel: '1:30',
      ...sharedLabels,
    },
    {
      variant: 'cornerTab',
      title: t('home.restTimerMockups.variants.cornerTab'),
      restLabel: '2m',
      ...sharedLabels,
    },
    {
      variant: 'tileBar',
      title: t('home.restTimerMockups.variants.tileBar'),
      restLabel: '60s',
      ...sharedLabels,
    },
    {
      variant: 'idleSlot',
      title: t('home.restTimerMockups.variants.idleSlot'),
      restLabel: '75s',
      ...sharedLabels,
    },
  ];

  return (
    <View className="mb-5 gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-[17px] font-bold text-foreground">
          {t('home.restTimerMockups.title')}
        </Text>
        <Text className="text-[12px] font-bold uppercase tracking-[0.6px] text-muted">
          {t('home.restTimerMockups.count')}
        </Text>
      </View>
      {variants.map(variant => (
        <MockSetTopbar key={variant.variant} {...variant} />
      ))}
    </View>
  );
}
