import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '@pumped/ui/clay/SettingsSection';
import { ListRow } from '@pumped/ui/clay/ListRow';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import { OptionSelectorSheet } from '@pumped/ui/forms/OptionSelectorSheet';
import {
  useHealthConnection,
  type HealthSourceEntry,
} from '@/hooks/useHealthConnection';
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

  /**
   * Was die Zeile einer Quelle über sich sagt.
   *
   * Eine nicht verfügbare Quelle nennt ihren Grund, statt bloß ausgegraut
   * dazustehen — „Health Connect ist nicht installiert" ist eine Antwort, eine
   * graue Zeile nicht. Der laufende Sync gehört dagegen nur an die aktive Zeile.
   */
  const sourceDetail = (entry: HealthSourceEntry) => {
    if (entry.state?.kind === 'unavailable') return entry.state.reason;
    if (entry.isActive) {
      if (connection.isBusy) {
        return connection.progressLabel ?? t('health.settings.syncing');
      }
      if (connection.needsReauth) return t('health.settings.needsReauth');
    }
    if (entry.state?.kind === 'connected')
      return t('health.settings.connected');
    return entry.detail;
  };

  const confirmSwitch = (entry: HealthSourceEntry) => {
    Alert.alert(
      t('health.settings.switchConfirm.title', { source: entry.name }),
      t('health.settings.switchConfirm.body', { source: entry.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('health.settings.switchConfirm.confirm'),
          style: 'destructive',
          onPress: () => {
            void connection.connectSource(entry.id);
          },
        },
      ],
    );
  };

  const pressSource = (entry: HealthSourceEntry) => {
    if (entry.state?.kind === 'unavailable') {
      Alert.alert(t('health.settings.unavailable'), entry.state.reason);
      return;
    }
    if (entry.isActive && entry.state?.kind === 'connected') {
      confirmDisconnect();
      return;
    }
    // Ein Wechsel räumt die Rohschicht (die Registry lässt nur eine Quelle zu).
    // Diese Warnung gehört **vor** die Anmeldung, nicht danach.
    if (!entry.ownsHistory) {
      confirmSwitch(entry);
      return;
    }
    void connection.connectSource(entry.id);
  };

  return (
    <SettingsSection label={t('health.settings.title')}>
      {connection.sources.map(entry => (
        <ListRow
          key={entry.id}
          icon={<ClayIcon name="pulse" size={18} color={colors.accent} />}
          label={entry.name}
          detail={sourceDetail(entry)}
          trailing={
            entry.isActive && entry.state?.kind === 'connected'
              ? undefined
              : chevron
          }
          divider
          onPress={connection.isBusy ? undefined : () => pressSource(entry)}
          testID={`settings_health_source_${entry.id}`}
        />
      ))}

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
