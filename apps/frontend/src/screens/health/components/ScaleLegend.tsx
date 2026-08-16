import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@pumped/ui/theme/tokens';

/**
 * Die Höhen stammen aus `DeviationRow` und müssen dort gleich bleiben.
 *
 * Die Legende zeigt keine stellvertretenden Punkte, sondern **dieselben
 * Striche** in derselben Größe. Ein Kreis oder ein Quadrat daneben wäre eine
 * Übersetzung, die man erst wieder zurückübersetzen muss.
 */
const CENTER_HEIGHT = 12;
const MARK_HEIGHT = 18;
const TICK_WIDTH = 7;

function Swatch({ color, height }: { color: string; height: number }) {
  return (
    <View
      className="rounded-[1px]"
      style={{ width: TICK_WIDTH, height, backgroundColor: color }}
    />
  );
}

/**
 * Was die beiden Farben auf der Strichskala bedeuten.
 *
 * Einmal über allen Zeilen statt in jeder: Die Skala ist in allen vier
 * dieselbe, und viermal dieselbe Erklärung liest niemand.
 *
 * Die graue Marke fehlt in einer Zeile, sobald der Wert genau auf der Mitte
 * liegt — die farbige überdeckt sie dann. Das ist kein Fehler der Legende: Wo
 * beide zusammenfallen, gibt es nichts zu unterscheiden.
 */
export function ScaleLegend() {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-4 mb-2.5 px-1">
      <View className="flex-row items-center gap-1.5">
        <Swatch color={colors.muted} height={CENTER_HEIGHT} />
        <Text className="text-[11.5px] text-muted">
          {t('health.metrics.legendUsual')}
        </Text>
      </View>
      <View className="flex-row items-center gap-1.5">
        <Swatch color={colors.accent} height={MARK_HEIGHT} />
        <Text className="text-[11.5px] text-muted">
          {t('health.metrics.legendReading')}
        </Text>
      </View>
    </View>
  );
}
