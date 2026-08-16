import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from 'heroui-native';
import { AppBottomSheet } from '@pumped/ui/forms/AppBottomSheet';
import { DateWheelPicker } from '@pumped/ui/forms/DateWheelPicker';
import { Button } from '@pumped/ui/clay/Button';
import { SegmentedControl } from '@pumped/ui/clay/SegmentedControl';
import {
  deleteAnnotation,
  markAnnotation,
  reshapeAnnotation,
} from '@/data/local/health/annotationStore';
import { useAnnotations } from '@/hooks/useAnnotations';
import {
  annotationSpan,
  openAnnotation,
  type Annotation,
} from '@/lib/health/algorithms/annotations';
import {
  civilDateFromLocal,
  civilDateToUTCDate,
  type CivilDate,
} from '@/lib/health/civilDate';
import { useNoticesStore } from '@/stores/noticesStore';

/**
 * Wie weit zurück sich ein Zeitraum legen lässt.
 *
 * Großzügig, weil ein Rückblick auf das Jahr ein legitimer Grund ist, eine alte
 * Grippe nachzutragen — anders als bei der Erkennung, die nur die letzten zwei
 * Wochen anspricht.
 */
const MAX_BACKDATE_DAYS = 365;

type TrackIllnessSheetProps = {
  visible: boolean;
  onClose: () => void;
  /**
   * Der Zeitraum, der bearbeitet wird.
   *
   * Fehlt er, sucht sich das Blatt den offenen selbst — so verhält sich die
   * Schnellaktion richtig, ohne dass ihr Aufrufer die Markierungen kennen muss.
   * `null` erzwingt einen neuen Eintrag, auch wenn gerade einer offen ist.
   */
  target?: Annotation | null;
};

type Edge = 'from' | 'to';

function toCivilDate(date: Date): CivilDate {
  return civilDateFromLocal(date);
}

/** Ein Zivildatum als lokales `Date` für die Räder. */
function toLocalDate(value: CivilDate): Date {
  return new Date(
    Math.trunc(value / 10000),
    (Math.trunc(value / 100) % 100) - 1,
    value % 100,
  );
}

type OngoingToggleProps = {
  active: boolean;
  onToggle: () => void;
  label: string;
  hint: string;
};

function OngoingToggle({ active, onToggle, label, hint }: OngoingToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: active }}
      className="flex-row items-center justify-between rounded-[18px] border border-border-hairline bg-surface-card px-4 py-3.5"
      onPress={onToggle}
      testID="illness-ongoing-toggle"
    >
      <View className="flex-1 pr-3">
        <Text className="t-label text-foreground">{label}</Text>
        <Text className="t-caption text-muted">{hint}</Text>
      </View>
      <View
        className={`h-7 w-12 justify-center rounded-full px-0.5 ${
          active ? 'bg-accent' : 'bg-surface-sunk'
        }`}
      >
        <View
          className={`h-6 w-6 rounded-full bg-cream ${
            active ? 'self-end' : 'self-start'
          }`}
        />
      </View>
    </Pressable>
  );
}

/**
 * Der Entwurf, den das Blatt gerade bearbeitet.
 *
 * Eigener Hook, weil die Vorbelegung mehr ist als ein Anfangswert: Das Blatt
 * bleibt montiert, also muss sie beim **Öffnen** laufen und nicht beim
 * Einhängen.
 */
function useIllnessDraft(visible: boolean, existing: Annotation | null) {
  const today = civilDateFromLocal(new Date());
  const [from, setFrom] = useState(() => toLocalDate(today));
  const [to, setTo] = useState(() => toLocalDate(today));
  const [ongoing, setOngoing] = useState(true);
  const [edge, setEdge] = useState<Edge>('from');

  useEffect(() => {
    if (!visible) return;
    if (existing === null) {
      setFrom(toLocalDate(today));
      setTo(toLocalDate(today));
      setOngoing(true);
    } else {
      const span = annotationSpan(existing);
      setFrom(toLocalDate(span.from));
      setTo(toLocalDate(span.isOpen ? today : span.to));
      setOngoing(span.isOpen);
    }
    setEdge('from');
    // Abhängig von der Sichtbarkeit, nicht von jeder Neuberechnung der Liste —
    // sonst setzte ein Schreibvorgang die Räder unter dem Finger zurück.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Die Enden können sich beim Drehen überholen; geordnet wird beim Anzeigen
  // und beim Speichern, nicht im Zustand — sonst spränge das Rad unter dem
  // Finger weg.
  const fromDate = toCivilDate(from);
  const toDate = toCivilDate(to);

  return {
    today,
    from,
    to,
    setFrom,
    setTo,
    ongoing,
    setOngoing,
    edge,
    setEdge,
    fromDate,
    orderedFrom: Math.min(fromDate, toDate),
    orderedTo: Math.max(fromDate, toDate),
  };
}

/**
 * Von wann bis wann du krank warst.
 *
 * Ein Rad statt zweier nebeneinander: Drei Spalten sind schon 190 px breit, ein
 * zweiter Satz daneben passte auf kein Telefon. Der Umschalter oben sagt, welches
 * Ende gerade eingestellt wird, und die Überschrift zeigt durchgehend beide —
 * so bleibt sichtbar, was man baut, während man an einer Seite dreht.
 *
 * Ist bereits eine Krankheit offen, **bearbeitet** das Blatt sie, statt eine
 * zweite danebenzulegen. Zwei sich überlappende Zeiträume ergäben dieselbe
 * Wirkung auf die Baseline und wären hinterher nicht auseinanderzuhalten.
 */
export function TrackIllnessSheet({
  visible,
  onClose,
  target,
}: TrackIllnessSheetProps) {
  const { t, i18n } = useTranslation();
  const annotations = useAnnotations();
  const restore = useNoticesStore(state => state.restore);

  const existing =
    target === undefined
      ? openAnnotation(annotations, 'sick', civilDateFromLocal(new Date()))
      : target;
  const draft = useIllnessDraft(visible, existing);
  const {
    from,
    to,
    setFrom,
    setTo,
    ongoing,
    setOngoing,
    edge,
    setEdge,
    fromDate,
    orderedFrom,
    orderedTo,
  } = draft;

  const maximumDate = toLocalDate(draft.today);
  const minimumDate = new Date(
    maximumDate.getFullYear(),
    maximumDate.getMonth(),
    maximumDate.getDate() - MAX_BACKDATE_DAYS,
  );

  const formatDay = (value: CivilDate) =>
    civilDateToUTCDate(value).toLocaleDateString(i18n.language, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    });

  const save = () => {
    const start = ongoing ? fromDate : orderedFrom;
    const end = ongoing ? null : orderedTo;
    if (existing === null) {
      markAnnotation({ type: 'sick', from: start, to: end });
    } else {
      reshapeAnnotation(existing.id, start, end);
    }
    onClose();
  };

  const remove = () => {
    if (existing === null) return;
    deleteAnnotation(existing.id);
    // Der Verdacht, den diese Markierung beantwortet hat, darf wieder
    // auftauchen — sonst legte ein Fehlgriff die Meldung dauerhaft still.
    restore(`illness:${annotationSpan(existing).from}`);
    onClose();
  };

  return (
    <AppBottomSheet open={visible} onClose={onClose}>
      <BottomSheet.Overlay />
      <AppBottomSheet.Content backgroundClassName="bg-background">
        <View className="items-center">
          <BottomSheet.Title className="text-[21px] font-bold text-foreground">
            {t('health.sick.sheetTitle')}
          </BottomSheet.Title>
          <BottomSheet.Description className="mt-1 text-center text-[13px] text-muted">
            {t('health.sick.sheetDescription')}
          </BottomSheet.Description>
        </View>

        <Text className="mt-4 text-center text-[22px] font-bold text-foreground">
          {ongoing
            ? t('health.sick.sinceValue', { date: formatDay(fromDate) })
            : `${formatDay(orderedFrom)} – ${formatDay(orderedTo)}`}
        </Text>

        <SegmentedControl
          className="mt-4"
          value={edge}
          options={[
            { value: 'from', label: t('health.sick.from') },
            {
              value: 'to',
              label: ongoing
                ? t('health.sick.ongoingValue')
                : t('health.sick.to'),
            },
          ]}
          onChange={value => {
            // Solange offen markiert wird, gibt es kein Ende einzustellen.
            if (value === 'to' && ongoing) return;
            setEdge(value as Edge);
          }}
        />

        <View className="mt-3">
          <DateWheelPicker
            value={edge === 'from' ? from : to}
            onChange={edge === 'from' ? setFrom : setTo}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        </View>

        <View className="mt-3">
          <OngoingToggle
            active={ongoing}
            label={t('health.sick.ongoing')}
            hint={t('health.sick.ongoingHint')}
            onToggle={() => {
              const next = !ongoing;
              setOngoing(next);
              if (next) setEdge('from');
            }}
          />
        </View>

        <View className="mt-5 flex-row gap-2">
          {existing === null ? (
            <Button
              size="md"
              variant="ghost"
              className="flex-1"
              onPress={onClose}
              testID="illness-cancel"
            >
              {t('common.cancel')}
            </Button>
          ) : (
            <Button
              size="md"
              variant="ghost"
              className="flex-1"
              onPress={remove}
              testID="illness-delete"
            >
              {t('health.sick.remove')}
            </Button>
          )}
          <Button
            size="md"
            className="flex-1"
            elevated={false}
            onPress={save}
            testID="illness-save"
          >
            {t('common.save')}
          </Button>
        </View>
      </AppBottomSheet.Content>
    </AppBottomSheet>
  );
}
