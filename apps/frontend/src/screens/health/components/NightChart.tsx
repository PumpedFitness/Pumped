import { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, {
  Circle,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import { colors } from '@pumped/ui/theme/tokens';
import type { UsualRange } from '@/lib/health/algorithms/params';
import {
  hypnogram,
  type SleepNight,
  type SleepStage,
} from '@/lib/health/algorithms/sleep';
import {
  CHART_HEIGHT,
  nightScale,
  type Extreme,
  type NightScale,
  type TimedValue,
} from './nightScale';

type NightChartProps = {
  night: SleepNight;
  curve: readonly TimedValue[];
  /** Normalband des Ruhepulses — die einzige Referenz, die es dafür gibt. */
  restingBand: UsualRange | null;
  columns?: number;
  /** Nur die Stunde — eine Stundenachse braucht keine Minuten. */
  formatHour: (epochSeconds: number) => string;
};

export const HYPNOGRAM_LANES: readonly SleepStage[] = [
  'awake',
  'rem',
  'core',
  'deep',
];

/**
 * Eigene Töne für die Schlafphasen, außerhalb der Markenpalette.
 *
 * Pumped kennt genau einen Akzent, und vier Abstufungen davon ließen sich als
 * Phasen nicht unterscheiden — ein Versuch mit Gold, Terrakotta, Rosé und
 * Dunkelrot ergab eine Wand aus Rottönen. Schlafphasen sind eine eigene
 * Kategorie und dürfen eine eigene Skala haben.
 *
 * Sehr hell, und mit Absicht **ungleichmäßig** abgestuft: Die Felder decken die
 * gesamte Fläche, es bleibt also kein heller Rest, an dem sich das Auge
 * ausruhen könnte. Ein gleichmäßiger Vierer-Ramp ergab genau das — eine
 * geschlossene blaugraue Wand, über der die Kurve unterging. REM und Core
 * liegen deshalb dicht am Kartenton und bilden zusammen den ruhigen Grund;
 * Tiefschlaf und Wachsein setzen sich klar davon ab. Das ist auch die
 * Rangfolge, die zählt: gewöhnlich geschlafen, tief geschlafen, wach gewesen.
 */
export const STAGE_COLOR: Record<SleepStage, string> = {
  awake: '#F5DAC2',
  rem: '#EDF2FA',
  core: '#DBE5F5',
  deep: '#B4C5E8',
};

const TICK_LABEL_WIDTH = 52;

/**
 * Breite der Pulsachse links.
 *
 * Schmal gehalten: Sie trägt zweistellige bpm-Werte und sonst nichts. Ein
 * früherer Versuch mit ausgeschriebenen Beschriftungen („HEART RATE") brauchte
 * das Dreifache und brach trotzdem um.
 */
const AXIS_WIDTH = 26;

/**
 * Maße der Pille um die Extremwerte.
 *
 * Als bloße Zahl lag die Beschriftung mal auf der Kurve, mal auf einem
 * Phasenfeld, und der Untergrund entschied über die Lesbarkeit. Gefüllt trägt
 * sie ihren eigenen Kontrast mit.
 */
const PILL_HEIGHT = 17;
const PILL_PADDING = 6;
const DIGIT_WIDTH = 6.4;
/** Abstand der Pillenmitte vom Messpunkt, und ab wann sie umklappt. */
const LABEL_OFFSET = 14;
const LABEL_ROOM = LABEL_OFFSET + PILL_HEIGHT / 2 + 2;

type Band = { stage: SleepStage; from: number; to: number };

/**
 * Benachbarte Säulen derselben Phase zu einem Feld zusammenfassen.
 *
 * Ohne das steht hinter der Kurve ein Streifenmuster statt einer Fläche.
 */
function toBands(
  bars: readonly (SleepStage | null)[],
  night: SleepNight,
  columns: number,
): Band[] {
  const span = night.endTs - night.startTs;
  const bands: Band[] = [];

  bars.forEach((stage, index) => {
    if (stage === null) return;
    const from = night.startTs + (index / columns) * span;
    const to = night.startTs + ((index + 1) / columns) * span;
    const last = bands[bands.length - 1];
    if (last !== undefined && last.stage === stage && last.to === from) {
      last.to = to;
    } else {
      bands.push({ stage, from, to });
    }
  });

  return bands;
}

/**
 * Puls über den Phasenfeldern.
 *
 * Drei Anläufe brauchte das. Der erste legte eine Kurve über schmale
 * Phasenspuren — unlesbar, weil „oben" zweierlei hieß: bei den Spuren wach, bei
 * der Kurve hoher Puls. Der zweite stellte beide untereinander — lesbar, aber
 * auseinandergezogen, und der Blick musste die Spalten selbst verbinden. Als
 * ganzhohe Felder belegen die Phasen nur noch die **Zeitachse**; die vertikale
 * Achse gehört allein der Kurve, und der Konflikt ist weg.
 */
export function NightChart({
  night,
  curve,
  restingBand,
  columns = 64,
  formatHour,
}: NightChartProps) {
  const [width, setWidth] = useState(0);

  const bands = toBands(hypnogram(night, columns), night, columns);
  const scale = nightScale(night, curve, restingBand, width, AXIS_WIDTH);

  return (
    <View onLayout={event => setWidth(event.nativeEvent.layout.width)}>
      <View style={{ height: CHART_HEIGHT }}>
        {width > 0 ? (
          <Svg width={width} height={CHART_HEIGHT}>
            <StageBands bands={bands} scale={scale} />
            <ValueAxis scale={scale} />
            <RestingLine
              scale={scale}
              restingBand={restingBand}
              width={width}
            />
            {scale.path !== '' ? (
              <Path
                d={scale.path}
                stroke={colors.accent}
                strokeWidth={1.75}
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
              />
            ) : null}
            <ExtremeLabel
              point={scale.maxPoint}
              scale={scale}
              width={width}
              above
            />
            <ExtremeLabel
              point={scale.minPoint}
              scale={scale}
              width={width}
              above={false}
            />
          </Svg>
        ) : null}
      </View>

      <View style={{ height: 18 }} className="mt-1.5">
        {width > 0
          ? scale.ticks.map(ts => (
              <Text
                key={ts}
                numberOfLines={1}
                className="absolute text-[10.5px] text-muted"
                style={{
                  left: scale.x(ts) - TICK_LABEL_WIDTH / 2,
                  width: TICK_LABEL_WIDTH,
                  textAlign: 'center',
                }}
              >
                {formatHour(ts)}
              </Text>
            ))
          : null}
      </View>
    </View>
  );
}

function StageBands({
  bands,
  scale,
}: {
  bands: readonly Band[];
  scale: NightScale;
}) {
  return (
    <>
      {bands.map((band, index) => (
        <Rect
          key={index}
          x={scale.x(band.from)}
          y={0}
          width={Math.max(1, scale.x(band.to) - scale.x(band.from))}
          height={CHART_HEIGHT}
          fill={STAGE_COLOR[band.stage]}
        />
      ))}
    </>
  );
}

/**
 * Die Pulsachse links neben dem Diagramm.
 *
 * Nur Zahlen, keine Linien ins Bild hinein: Die Phasenfelder geben der Fläche
 * schon eine Gliederung, und waagerechte Hilfslinien darüber ergäben ein Netz,
 * in dem die Kurve untergeht. Die Kante der Felder ist die Achse.
 */
function ValueAxis({ scale }: { scale: NightScale }) {
  if (!scale.hasCurve) return null;

  return (
    <>
      {scale.valueTicks.map(value => (
        <SvgText
          key={value}
          x={AXIS_WIDTH - 7}
          // Grundlinie statt Mitte — `alignmentBaseline` ist auf Android
          // unzuverlässig.
          y={scale.y(value) + 3.4}
          fontSize={9.5}
          fill={colors.muted}
          textAnchor="end"
        >
          {value}
        </SvgText>
      ))}
    </>
  );
}

/** Der übliche Ruhepuls als Bezugslinie hinter der Nacht. */
function RestingLine({
  scale,
  restingBand,
  width,
}: {
  scale: NightScale;
  restingBand: UsualRange | null;
  width: number;
}) {
  if (restingBand === null || !scale.hasCurve) return null;

  return (
    <Line
      x1={AXIS_WIDTH}
      y1={scale.y(restingBand.center)}
      x2={width}
      y2={scale.y(restingBand.center)}
      stroke={colors.ink}
      strokeWidth={1}
      strokeDasharray="2 4"
      opacity={0.3}
    />
  );
}

/**
 * Der tiefste und der höchste Puls der Nacht, direkt an der Kurve beschriftet.
 *
 * Es ist die einzige Skala, die die vertikale Achse bekommt — eine volle
 * Achsenbeschriftung mit gleichmäßigen Schritten wäre hier Beiwerk. Zwei Zahlen
 * an den Wendepunkten sagen dasselbe: „so tief ist sie gefallen, so hoch
 * gestiegen", und zwar an der Stelle, an der es passiert ist.
 *
 * Extremwerte liegen naturgemäß am Rand — genau dort, wo die bevorzugte Seite
 * keinen Platz mehr hat. Dann klappt die Zahl um, statt abgeschnitten zu
 * werden.
 */
function ExtremeLabel({
  point,
  scale,
  width,
  above,
}: {
  point: Extreme | null;
  scale: NightScale;
  width: number;
  above: boolean;
}) {
  if (point === null) return null;

  const label = String(Math.round(point.value));
  // Kein Textmaß in SVG — die Breite kommt aus der Ziffernzahl. Die Schrift ist
  // fett und tabellarisch genug, dass eine feste Ziffernbreite reicht.
  const pillWidth = label.length * DIGIT_WIDTH + PILL_PADDING * 2;

  const y = scale.y(point.value);
  const placeAbove = above ? y > LABEL_ROOM : y > CHART_HEIGHT - LABEL_ROOM;
  const centerY = placeAbove ? y - LABEL_OFFSET : y + LABEL_OFFSET;
  // Links an der Achse abgefangen, nicht am Bildrand — sonst schöbe sich die
  // Pille über die bpm-Zahlen, sobald der Extremwert früh in der Nacht liegt.
  const centerX = Math.min(
    Math.max(scale.x(point.ts), AXIS_WIDTH + pillWidth / 2),
    width - pillWidth / 2,
  );

  return (
    <>
      <Circle cx={scale.x(point.ts)} cy={y} r={2.5} fill={colors.accent} />
      <Rect
        x={centerX - pillWidth / 2}
        y={centerY - PILL_HEIGHT / 2}
        width={pillWidth}
        height={PILL_HEIGHT}
        rx={PILL_HEIGHT / 2}
        fill={colors.accent}
      />
      <SvgText
        x={centerX}
        // SVG setzt Text auf die Grundlinie, nicht auf die Mitte. Der Versatz
        // schiebt ihn in die Pille — `alignmentBaseline` ist auf Android
        // unzuverlässig.
        y={centerY + 3.8}
        fontSize={10.5}
        fontWeight="700"
        fill={colors.onInk}
        textAnchor="middle"
      >
        {label}
      </SvgText>
    </>
  );
}
