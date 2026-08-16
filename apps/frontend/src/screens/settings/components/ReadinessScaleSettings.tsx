import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '@pumped/ui/clay/SettingsSection';
import { ListRow } from '@pumped/ui/clay/ListRow';
import { StepperField } from '@pumped/ui/clay/StepperField';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import { useHealthSnapshot } from '@/hooks/useHealthSnapshot';
import {
  SCALE_MAX,
  SCALE_MIN,
  SCORE_MAX,
  thresholdBounds,
  THRESHOLD_ORDER,
  type ScoreThresholds,
  type ThresholdLabel,
} from '@/lib/health/algorithms/scoreScale';
import { useHealthSettingsStore } from '@/stores/healthSettingsStore';

/** A score written as the deviation it stands for: "+1.06σ". */
function sigmaOf(score: number, scale: number): string {
  const sigma = (score - 50) / scale;
  return `${sigma >= 0 ? '+' : ''}${sigma.toFixed(2)}σ`;
}

function ScorePreview() {
  const { t } = useTranslation();
  const scale = useHealthSettingsStore(state => state.scale);
  const snapshot = useHealthSnapshot();
  const { score, label } = snapshot.result;

  return (
    <View className="flex-row items-end justify-between px-4 pb-4 pt-4">
      <View className="flex-1">
        <Text className="text-[11px] font-[700] uppercase tracking-[1.2px] text-muted">
          {t('health.scale.preview')}
        </Text>
        {score === null ? (
          <Text className="mt-1 text-[15px] font-[600] text-muted">
            {t('health.scale.noScore')}
          </Text>
        ) : (
          <View className="mt-1 flex-row items-baseline gap-1.5">
            <Text className="text-[34px] font-[800] leading-[38px] tracking-[-1px] text-foreground">
              {score}
            </Text>
            <Text className="text-[13px] font-[600] text-muted">
              /{SCORE_MAX} · {sigmaOf(score, scale)}
            </Text>
          </View>
        )}
      </View>
      {label === null ? null : (
        <Text className="pb-1.5 text-[13px] font-[700] uppercase tracking-[1.4px] text-accent">
          {t(`health.label.${label}`)}
        </Text>
      )}
    </View>
  );
}

type ThresholdStepperProps = {
  label: ThresholdLabel;
  thresholds: ScoreThresholds;
  scale: number;
  onChange: (label: ThresholdLabel, value: number) => void;
};

function ThresholdStepper({
  label,
  thresholds,
  scale,
  onChange,
}: ThresholdStepperProps) {
  const { t } = useTranslation();
  const bounds = thresholdBounds(thresholds, label);
  const value = thresholds[label];

  return (
    <View className="gap-1.5">
      <StepperField
        label={t('health.scale.threshold', {
          label: t(`health.label.${label}`),
        })}
        value={value}
        min={bounds.min}
        max={bounds.max}
        onChange={next => onChange(label, next)}
        testID={`readiness-threshold-${label}`}
      />
      <Text className="text-[11.5px] text-muted">
        {t('health.scale.thresholdHint', { sigma: sigmaOf(value, scale) })}
      </Text>
    </View>
  );
}

/**
 * Auflösung und Beschriftung des Readiness-Scores.
 *
 * Der Score selbst bleibt, was er war — ein Vergleich mit der eigenen
 * Baseline. Einstellbar ist, wie viele Punkte eine Abweichung wert ist und ab
 * wann ein Wort dafür einsteht. Beides steht als σ neben der Zahl: Ohne diese
 * Umrechnung sind „67" und „16 Punkte" zwei Zahlen ohne Bezug, und niemand
 * kann sehen, dass die Vorgabe „Bereit" erst gut eine Standardabweichung über
 * dem eigenen Normal vergibt.
 */
export function ReadinessScaleSettings() {
  const { t } = useTranslation();
  const sourceConnected = useHealthSettingsStore(
    state => state.sourceConnected,
  );
  const scale = useHealthSettingsStore(state => state.scale);
  const setScale = useHealthSettingsStore(state => state.setScale);
  const thresholds = useHealthSettingsStore(state => state.thresholds);
  const setThreshold = useHealthSettingsStore(state => state.setThreshold);
  const reset = useHealthSettingsStore(state => state.resetScoreScale);

  // Ohne verbundene Quelle gibt es keinen Score — dann wären das Regler an
  // einer Zahl, die nirgends steht.
  if (!sourceConnected) return null;

  return (
    <SettingsSection label={t('health.scale.title')}>
      <ScorePreview />

      <View className="gap-5 border-t border-border-hairline px-4 pb-4 pt-4">
        <View className="gap-1.5">
          <StepperField
            label={t('health.scale.sensitivity')}
            value={scale}
            min={SCALE_MIN}
            max={SCALE_MAX}
            onChange={setScale}
            format={value => t('health.scale.points', { count: value })}
            testID="readiness-scale"
          />
          <Text className="text-[11.5px] text-muted">
            {t('health.scale.sensitivityHint', { value: 50 + scale })}
          </Text>
        </View>

        <Text className="text-[11px] font-[700] uppercase tracking-[1.2px] text-muted">
          {t('health.scale.thresholds')}
        </Text>

        {THRESHOLD_ORDER.map(label => (
          <ThresholdStepper
            key={label}
            label={label}
            thresholds={thresholds}
            scale={scale}
            onChange={setThreshold}
          />
        ))}
      </View>

      <ListRow
        icon={<ClayIcon name="swap" size={18} color={colors.accent} />}
        label={t('health.scale.reset')}
        onPress={reset}
        testID="readiness-scale-reset"
      />
    </SettingsSection>
  );
}
