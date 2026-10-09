import { useTranslation } from 'react-i18next';
import { ListRow } from '@pumped/ui/clay/ListRow';
import { SettingsSection } from '@pumped/ui/clay/SettingsSection';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import type { MetricKey } from '@/data/local/metrics/metricSamples';
import {
  METRIC_CATALOG,
  METRIC_KEYS,
} from '@/components/widgets/metric-tracker/metricCatalog';

type MetricPickerSectionProps = {
  value: MetricKey;
  onChange: (metric: MetricKey) => void;
};

export function MetricPickerSection({
  value,
  onChange,
}: MetricPickerSectionProps) {
  const { t } = useTranslation();
  return (
    <SettingsSection label={t('widgets.metricTracker.config.data')}>
      {METRIC_KEYS.map((key, index) => (
        <ListRow
          key={key}
          testID={`metric-option-${key}`}
          divider={index > 0}
          paddingVertical={10}
          icon={
            <ClayIcon
              name={METRIC_CATALOG[key].icon}
              size={17}
              color={colors.accent}
            />
          }
          label={t(`widgets.metricTracker.metrics.${key}`)}
          trailing={
            key === value ? (
              <ClayIcon name="check" size={18} color={colors.accent} />
            ) : undefined
          }
          onPress={() => onChange(key)}
        />
      ))}
    </SettingsSection>
  );
}
