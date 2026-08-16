import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { colors } from '@pumped/ui/theme/tokens';
import type { IndexSpan } from '@/lib/health/algorithms/annotations';
import type { UsualRange } from '@/lib/health/algorithms/params';

type BandChartProps = {
  values: readonly number[];
  /** Das persönliche Normalband, in derselben Einheit wie `values`. */
  band: UsualRange | null;
  width: number;
  height: number;
  /** Punkt unter dem Finger. `null` heißt: nichts hervorheben. */
  highlightIndex?: number | null;
  highlightColor?: string;
  /** Markierte Abschnitte, als Positionen in `values`. */
  annotatedSpans?: readonly IndexSpan[];
};

const PAD = 6;

/**
 * Ein markierter Abschnitt reicht mindestens so weit.
 *
 * Ein einzelner Krankheitstag ist ein Punkt ohne Breite; ohne Mindestmaß bliebe
 * er unsichtbar, und ausgerechnet der kurze Infekt, den man leicht vergisst,
 * hinterließe keine Spur im Verlauf.
 */
const MIN_SPAN_WIDTH = 6;

/**
 * Verlauf mit hinterlegtem Normalband.
 *
 * Das graue Feld ist `center ± 1σ`, die gepunktete Linie die Mitte. Damit liest
 * sich jeder Ausschlag gegen die eigene Referenz statt gegen die Skala des
 * Diagramms — genau die Aussage, die eine nackte Sparkline schuldig bleibt.
 *
 * Die Skala umfasst Werte **und** Band, sonst läge der Korridor außerhalb des
 * Bildes, sobald die letzten Tage ungewöhnlich waren.
 *
 * Markierte Tage bekommen eine getönte Spalte hinter der Linie. Sie sind aus
 * der Referenz genommen, aber nicht aus dem Verlauf — ein Diagramm, aus dem
 * eine Woche verschwindet, sieht aus wie ein Datenfehler. So bleibt der
 * Einbruch sichtbar und trägt zugleich seine Erklärung.
 */
export function BandChart({
  values,
  band,
  width,
  height,
  highlightIndex = null,
  highlightColor,
  annotatedSpans = [],
}: BandChartProps) {
  if (values.length < 2) return null;

  const candidates = [
    ...values,
    ...(band === null ? [] : [band.low, band.high]),
  ];
  const min = Math.min(...candidates);
  const max = Math.max(...candidates);
  const span = max - min || 1;

  const innerW = width - PAD * 2;
  const innerH = height - PAD * 2;
  const y = (value: number) => PAD + innerH * (1 - (value - min) / span);
  const x = (index: number) =>
    PAD + (values.length > 1 ? (innerW / (values.length - 1)) * index : 0);

  const path = values
    .map((value, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(value)}`)
    .join(' ');

  const last = values[values.length - 1];

  return (
    <Svg width={width} height={height}>
      {/* Vor dem Normalband: Die Tönung ist Hintergrund, kein Datum. */}
      {annotatedSpans.map(span => {
        const left = x(span.from);
        const right = x(span.to);
        return (
          <Rect
            key={`${span.from}-${span.to}`}
            x={left}
            y={0}
            width={Math.max(MIN_SPAN_WIDTH, right - left)}
            height={height}
            fill={colors.accent}
            opacity={0.1}
            rx={3}
          />
        );
      })}

      {band !== null ? (
        <>
          <Rect
            x={0}
            y={y(band.high)}
            width={width}
            height={Math.max(1, y(band.low) - y(band.high))}
            fill={colors.track}
            rx={4}
          />
          <Line
            x1={0}
            y1={y(band.center)}
            x2={width}
            y2={y(band.center)}
            stroke={colors.muted}
            strokeWidth={1}
            strokeDasharray="2 4"
            opacity={0.55}
          />
        </>
      ) : null}

      <Path
        d={path}
        stroke={colors.ink}
        strokeWidth={1.75}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {highlightIndex === null ? (
        <Circle
          cx={x(values.length - 1)}
          cy={y(last)}
          r={3.5}
          fill={colors.ink}
        />
      ) : (
        <>
          <Line
            x1={x(highlightIndex)}
            y1={0}
            x2={x(highlightIndex)}
            y2={height}
            stroke={highlightColor ?? colors.ink}
            strokeWidth={1}
          />
          <Circle
            cx={x(highlightIndex)}
            cy={y(values[highlightIndex])}
            r={4.5}
            fill={highlightColor ?? colors.ink}
          />
        </>
      )}
    </Svg>
  );
}
