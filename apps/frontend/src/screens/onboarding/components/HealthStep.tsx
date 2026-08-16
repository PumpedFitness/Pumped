import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ClayIcon, type IconName } from '@pumped/ui/icons/ClayIcon';
import { Button } from '@pumped/ui/clay/Button';
import { colors } from '@pumped/ui/theme/tokens';
import { useHealthConnection } from '@/hooks/useHealthConnection';

type BenefitRowProps = {
  icon: IconName;
  label: string;
  body: string;
  delay: number;
};

function BenefitRow({ icon, label, body, delay }: BenefitRowProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(320).delay(delay)}
      className="flex-row items-start gap-4 rounded-[22px] border border-border-hairline bg-surface-card p-4"
    >
      <View className="w-11 h-11 rounded-[15px] bg-accent-soft items-center justify-center">
        <ClayIcon name={icon} size={21} color={colors.accent} />
      </View>
      <View className="flex-1">
        <Text className="text-[11px] font-bold uppercase tracking-[1.3px] text-muted">
          {label}
        </Text>
        <Text className="text-[14px] text-foreground mt-[3px] leading-[20px]">
          {body}
        </Text>
      </View>
    </Animated.View>
  );
}

/**
 * Optionaler Wizard-Schritt: Erholungsdaten anbinden.
 *
 * Bewusst überspringbar und bewusst ohne Druck — die App funktioniert ohne
 * Tracker vollständig. Wer verbindet, bekommt sofort den Sync mit; ein Consent,
 * nach dem der Screen leer bleibt, sähe aus wie ein Fehlschlag.
 */
export function HealthStep() {
  const { t } = useTranslation();
  const connection = useHealthConnection();

  const benefits: Omit<BenefitRowProps, 'delay'>[] = [
    {
      icon: 'pulse',
      label: t('onboarding.health.benefit.readinessLabel'),
      body: t('onboarding.health.benefit.readinessBody'),
    },
    {
      icon: 'clock',
      label: t('onboarding.health.benefit.sleepLabel'),
      body: t('onboarding.health.benefit.sleepBody'),
    },
    {
      icon: 'trend',
      label: t('onboarding.health.benefit.baselineLabel'),
      body: t('onboarding.health.benefit.baselineBody'),
    },
  ];

  return (
    <ScrollView
      contentContainerClassName="grow px-7 pt-4 pb-6"
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(320)}>
        <Text className="text-[11px] font-bold uppercase tracking-[2.2px] text-accent mb-3">
          {t('onboarding.health.eyebrow')}
        </Text>
        <Text className="text-[40px] font-[800] text-foreground tracking-[-0.8px] leading-[44px]">
          {t('onboarding.health.title')}
        </Text>
        <Text className="text-[15px] text-muted mt-3 leading-[22px]">
          {t('onboarding.health.subtitle')}
        </Text>
      </Animated.View>

      <View className="mt-7 gap-2.5">
        {benefits.map((row, index) => (
          <BenefitRow key={row.label} {...row} delay={160 + index * 90} />
        ))}
      </View>

      <Animated.View
        entering={FadeIn.duration(400).delay(460)}
        className="mt-7"
      >
        {connection.isConnected ? (
          <View className="flex-row items-center gap-3 rounded-[22px] bg-accent-soft p-4">
            <ClayIcon name="check" size={20} color={colors.accent} />
            <Text className="flex-1 text-[14px] font-semibold text-foreground">
              {t('onboarding.health.connected', {
                source: connection.sourceName,
              })}
            </Text>
          </View>
        ) : (
          <Button
            onPress={() => {
              void connection.connect();
            }}
            disabled={connection.isBusy}
            testID="onboarding_health_connect"
          >
            {connection.isBusy
              ? connection.progressLabel ?? t('onboarding.health.connecting')
              : t('onboarding.health.connect', {
                  source: connection.sourceName,
                })}
          </Button>
        )}

        {connection.isBusy ? (
          <View className="flex-row items-center gap-2.5 mt-3.5 px-1">
            <ActivityIndicator size="small" color={colors.muted} />
            <Text className="flex-1 text-[12.5px] text-muted">
              {connection.progressLabel ?? t('onboarding.health.connecting')}
            </Text>
          </View>
        ) : null}

        {connection.error !== null ? (
          <View className="flex-row items-start gap-2.5 mt-3.5 px-1">
            <ClayIcon name="warning" size={15} color={colors.muted} />
            <Text className="flex-1 text-[12.5px] text-muted leading-[18px]">
              {connection.error}
            </Text>
          </View>
        ) : null}
      </Animated.View>

      <Animated.View
        entering={FadeIn.duration(400).delay(560)}
        className="flex-row items-start gap-2.5 mt-5 px-1"
      >
        <ClayIcon name="settings" size={15} color={colors.muted} />
        <Text className="flex-1 text-[12.5px] text-muted leading-[18px]">
          {t('onboarding.health.note')}
        </Text>
      </Animated.View>
    </ScrollView>
  );
}
