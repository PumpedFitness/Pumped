import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '@pumped/ui/clay/Button';
import { Card } from '@pumped/ui/clay/Card';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import {
  endAnnotation,
  markAnnotation,
} from '@/data/local/health/annotationStore';
import { useHealthSnapshot } from '@/hooks/useHealthSnapshot';
import { civilDateFromLocal } from '@/lib/health/civilDate';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { formatChartDate } from '@/screens/health/formatMetric';
import { useHealthSettingsStore } from '@/stores/healthSettingsStore';
import { useNoticesStore } from '@/stores/noticesStore';
import { WidgetLabelRow } from '../shell/WidgetLabelRow';
import { buildNotices, type Notice, type NoticeAction } from './noticeModel';

type WidgetProps = { colSpan: number; width: number };

type NoticeCardProps = {
  notice: Notice;
  onRun: (action: NoticeAction) => void;
};

function NoticeCard({ notice, onRun }: NoticeCardProps) {
  return (
    <View className="gap-2.5 rounded-[18px] border border-border-hairline bg-surface-sunk p-3.5">
      <View className="flex-row items-start gap-2.5">
        <View className="mt-[1px]">
          <ClayIcon name={notice.icon} size={16} color={colors.accent} />
        </View>
        <View className="flex-1">
          <Text className="text-[14.5px] font-[700] leading-[19px] text-foreground">
            {notice.title}
          </Text>
          <Text className="mt-1 text-[12.5px] leading-[17px] text-muted">
            {notice.body}
          </Text>
          {notice.detail !== null && notice.detail !== '' ? (
            // Die Begründung in Zahlen. Ohne sie wäre die Karte eine
            // Behauptung, die der Nutzer nicht nachprüfen kann.
            <Text className="mt-1.5 text-[11.5px] font-[600] leading-[16px] text-muted">
              {notice.detail}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="flex-row gap-2">
        {notice.buttons.map(button => (
          <Button
            key={button.key}
            size="sm"
            variant={button.tone === 'primary' ? 'primary' : 'ghost'}
            elevated={false}
            className="flex-1"
            onPress={() => onRun(button.action)}
            testID={`notice-${notice.id}-${button.key}`}
          >
            {button.label}
          </Button>
        ))}
      </View>
    </View>
  );
}

/**
 * Was die App von sich aus zu sagen hat.
 *
 * Bewusst ein allgemeiner Träger und keine „Krankheits-Karte": Die Auffälligkeit
 * in den Verläufen ist der erste Anlass, aber die Stelle, an der eine App
 * ungefragt etwas meldet, sollte es nur einmal geben. Weitere Anlässe kommen als
 * weitere Zeilen in `buildNotices` dazu, nicht als weitere Kachel.
 *
 * Ohne verbundene Quelle bleibt die Kachel bei ihrem Ruhezustand — die
 * Erkennung hätte keine Reihen, gegen die sie prüfen könnte.
 */
export function NotificationsWidget(_props: WidgetProps) {
  const { t, i18n } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const snapshot = useHealthSnapshot();
  const sourceConnected = useHealthSettingsStore(
    state => state.sourceConnected,
  );
  const dismissed = useNoticesStore(state => state.dismissed);
  const dismiss = useNoticesStore(state => state.dismiss);

  const today = civilDateFromLocal(new Date());

  const notices = buildNotices({
    t,
    series: snapshot.series,
    annotations: snapshot.annotations,
    referenceDate: snapshot.referenceDate.date,
    today,
    hasData: snapshot.hasData && sourceConnected,
    dismissed,
    formatDate: date => formatChartDate(date, i18n.language),
  });

  const run = useCallback(
    (action: NoticeAction) => {
      switch (action.kind) {
        case 'markSick':
          markAnnotation({ type: 'sick', from: action.from, to: action.to });
          return;
        case 'endSick':
          endAnnotation(action.id, action.to);
          return;
        case 'dismiss':
          dismiss(action.noticeId);
          return;
        case 'openRecovery':
          navigation.dispatch(
            CommonActions.navigate({
              name: 'Main',
              params: { screen: 'Recovery' },
            }),
          );
      }
    },
    [dismiss, navigation],
  );

  return (
    <Card radius="lg" pad={16}>
      <View className="gap-[12px]">
        <WidgetLabelRow
          label={t('widgets.notifications.title')}
          right={
            notices.length > 0 ? (
              <View className="h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1.5">
                <Text className="text-[11px] font-[800] text-accent-foreground">
                  {notices.length}
                </Text>
              </View>
            ) : null
          }
        />

        {notices.length === 0 ? (
          // Eine leere Kachel sähe kaputt aus. „Nichts Auffälliges" ist eine
          // Aussage, und es ist die, die der Nutzer meistens lesen wird.
          <View className="flex-row items-center gap-2.5 py-1">
            <ClayIcon name="check" size={15} color={colors.muted} />
            <Text className="flex-1 text-[13px] leading-[18px] text-muted">
              {t(
                sourceConnected
                  ? 'widgets.notifications.empty'
                  : 'widgets.notifications.noSource',
              )}
            </Text>
          </View>
        ) : (
          <View className="gap-2.5">
            {notices.map(notice => (
              <NoticeCard key={notice.id} notice={notice} onRun={run} />
            ))}
          </View>
        )}
      </View>
    </Card>
  );
}
