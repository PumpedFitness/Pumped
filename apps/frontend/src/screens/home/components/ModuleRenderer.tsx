import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ModuleShell } from './ModuleShell';
import { TonnageModule } from './modules/TonnageModule';
import { E1rmModule } from './modules/E1rmModule';
import { AdherenceModule } from './modules/AdherenceModule';
import { BodyweightModule } from './modules/BodyweightModule';
import { MuscleVolumeModule } from './modules/MuscleVolumeModule';
import { ReadinessModule } from './modules/ReadinessModule';
import { ComputedFieldModule } from './modules/ComputedFieldModule';
import type { ModulePlacement } from '../dashboardModules';
import type { HomeDashboardData } from '../useHomeDashboardData';
import type { ComputedField } from '@/stores/computedFieldsStore';

type ModuleRendererProps = {
  placement: ModulePlacement;
  data: HomeDashboardData;
  computedField: ComputedField | null;
  editing: boolean;
  onRemove: () => void;
  onToggleSpan: () => void;
  onOpenTrends: () => void;
  dragHandle?: ReactNode;
};

/** Resolves a placement into its content + wraps it in the edit-aware shell. */
export function ModuleRenderer({
  placement,
  data,
  computedField,
  editing,
  onRemove,
  onToggleSpan,
  onOpenTrends,
  dragHandle,
}: ModuleRendererProps) {
  const { t } = useTranslation();
  const removeA11y = t('home.edit.removeA11y');
  const resizeA11y = t('home.edit.resizeA11y');

  const shell = (
    content: ReactNode,
    options?: {
      onPress?: () => void;
      inverted?: boolean;
      outlined?: boolean;
    },
  ) => (
    <ModuleShell
      editing={editing}
      onPress={options?.onPress}
      onRemove={onRemove}
      onToggleSpan={onToggleSpan}
      removeA11y={removeA11y}
      resizeA11y={resizeA11y}
      inverted={options?.inverted}
      outlined={options?.outlined}
      dragHandle={dragHandle}
      testID={`home-module-${placement.id}`}
    >
      {content}
    </ModuleShell>
  );

  switch (placement.kind) {
    case 'tonnage':
      return shell(
        <TonnageModule
          label={t('home.modules.tonnage.name')}
          bars={data.tonnageBars}
          value={data.tonnageTonnes}
          unit={t('home.units.tonnes')}
        />,
        { onPress: onOpenTrends },
      );
    case 'e1rm':
      return shell(
        <E1rmModule
          label={t('home.modules.e1rm.name')}
          value={data.e1rmValue}
          unit={data.weightUnitLabel}
          delta={data.e1rmDelta}
          deltaSuffix={t('home.units.days28')}
          spark={data.e1rmSpark}
          emptyLabel={t('home.modules.e1rm.empty')}
        />,
        { onPress: onOpenTrends },
      );
    case 'readiness':
      return shell(
        <ReadinessModule
          label={t('home.modules.readiness.name')}
          emptyTitle={t('home.modules.readiness.emptyTitle')}
          emptyBody={t('home.modules.readiness.emptyBody')}
        />,
      );
    case 'adherence':
      return shell(
        <AdherenceModule
          label={t('home.modules.adherence.name')}
          percent={data.adherencePercent}
          days={data.adherence}
        />,
      );
    case 'bodyweight':
      return shell(
        <BodyweightModule
          label={t('home.modules.bodyweight.name')}
          value={data.bodyweightValue}
          unit={data.weightUnitLabel}
          trendLine={
            data.bodyweightDeltaPerWeek != null
              ? t('home.modules.bodyweight.trend', {
                  delta: `${data.bodyweightDeltaPerWeek >= 0 ? '+' : ''}${data.bodyweightDeltaPerWeek.toFixed(1)}`,
                  unit: data.weightUnitLabel,
                })
              : ''
          }
          spark={data.bodyweightSpark}
          emptyLabel={t('home.modules.bodyweight.empty')}
        />,
        { inverted: true, onPress: onOpenTrends },
      );
    case 'muscleVolume':
      return shell(
        <MuscleVolumeModule
          label={t('home.modules.muscleVolume.name')}
          rows={data.muscleVolume}
          emptyLabel={t('home.modules.muscleVolume.empty')}
        />,
      );
    case 'custom':
      if (!computedField) return null;
      return shell(
        <ComputedFieldModule
          field={computedField}
          errorLabel={t('home.modules.custom.error')}
        />,
        { outlined: true },
      );
    default:
      return null;
  }
}
