import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '@pumped/ui/clay/SettingsSection';
import { ListRow } from '@pumped/ui/clay/ListRow';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import { OptionSelectorSheet } from '@pumped/ui/forms/OptionSelectorSheet';
import { useHealthConnection } from '@/hooks/useHealthConnection';
import { useHealthSnapshot } from '@/hooks/useHealthSnapshot';
import { MODEL_IDS, type ModelId } from '@/lib/health/algorithms/models';
import { useHealthSettingsStore } from '@/stores/healthSettingsStore';
import { IndexRowChevron } from './IndexRowChevron';

const chevron = <IndexRowChevron />;

function ModelSetting() {
  const { t } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const modelId = useHealthSettingsStore(state => state.modelId);
  const setModelId = useHealthSettingsStore(state => state.setModelId);

  // `custom` gehört auf den Modell-Screen, nicht in eine Auswahlliste: Es
  // entsteht dadurch, dass man einen Regler zieht, nicht dadurch, dass man es
  // anwählt.
  const options = MODEL_IDS.filter(id => id !== 'custom').map(id => ({
    value: id,
    label: t(`health.model.${id}.name`),
  }));
  const selected = options.find(option => option.value === modelId);

  return (
    <>
      <ListRow
        icon={<ClayIcon name="target" size={18} color={colors.accent} />}
        label={t('health.settings.model')}
        detail={selected?.label ?? t('health.model.custom.name')}
        trailing={chevron}
        onPress={() => setSheetOpen(true)}
      />
      <OptionSelectorSheet
        visible={sheetOpen}
        title={t('health.settings.model')}
        value={modelId}
        options={options}
        onClose={() => setSheetOpen(false)}
        onChange={value => setModelId(value as ModelId)}
      />
    </>
  );
}

/**
 * Verbindung zur Gesundheitsquelle und was daraus gerechnet wird.
 *
 * Trennen löscht nur die Token, nicht die Historie — ein versehentlicher Tap
 * darf keine Wochen an Daten kosten. Was das Trennen wirklich bedeutet, steht
 * deshalb im Bestätigungsdialog.
 */
export function HealthSettings() {
  const { t } = useTranslation();
  const connection = useHealthConnection();
  const snapshot = useHealthSnapshot();

  const confirmDisconnect = () => {
    Alert.alert(
      t('health.settings.disconnectConfirm.title'),
      t('health.settings.disconnectConfirm.body'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('health.settings.disconnect'),
          style: 'destructive',
          onPress: () => {
            void connection.disconnect();
          },
        },
      ],
    );
  };

  const statusDetail = () => {
    if (connection.isBusy) {
      return connection.progressLabel ?? t('health.settings.syncing');
    }
    if (connection.needsReauth) return t('health.settings.needsReauth');
    if (connection.isConnected) return t('health.settings.connected');
    return t('health.settings.notConnected');
  };

  return (
    <SettingsSection label={t('health.settings.title')}>
      <ListRow
        icon={<ClayIcon name="pulse" size={18} color={colors.accent} />}
        label={connection.sourceName}
        detail={statusDetail()}
        trailing={connection.isConnected ? undefined : chevron}
        divider
        onPress={
          connection.isBusy
            ? undefined
            : connection.isConnected
            ? confirmDisconnect
            : () => {
                void connection.connect();
              }
        }
        testID="settings_health_connection"
      />

      {connection.isConnected ? (
        <ListRow
          icon={<ClayIcon name="swap" size={18} color={colors.accent} />}
          label={t('health.settings.syncNow')}
          detail={
            snapshot.hasData
              ? t('health.settings.lastReading', {
                  days: snapshot.referenceDate.daysStale,
                  count: snapshot.referenceDate.daysStale,
                })
              : t('health.settings.noData')
          }
          divider
          onPress={
            connection.isBusy
              ? undefined
              : () => {
                  void connection.sync();
                }
          }
        />
      ) : null}

      <ModelSetting />

      {connection.error !== null ? (
        <View className="flex-row items-start gap-2.5 px-4 pt-1 pb-3">
          <ClayIcon name="warning" size={14} color={colors.muted} />
          <Text className="flex-1 text-[12px] text-muted leading-[17px]">
            {connection.error}
          </Text>
        </View>
      ) : null}
    </SettingsSection>
  );
}
