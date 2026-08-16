import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /** Rechts in der Titelzeile — in der App das Profilbild. */
  trailing?: ReactNode;
  className?: string;
};

/**
 * Die Kopfzeile eines Index-Screens: Titel, optionaler Untertitel, optionale
 * Aktion rechts.
 *
 * Jeder Screen der App beginnt so — Text, dann Inhalt. Das war bisher an drei
 * Stellen unterschiedlich ausgedrückt (zwei Kopien einer `IndexScreenHeader`
 * plus die nackte `t-display`-Klasse); hier steht es einmal.
 *
 * Die Ecke rechts ist der Grund für die Zusammenführung: Sie trägt auf jedem
 * Screen den Zugang zum Profil. Dadurch braucht die Tab-Leiste keinen eigenen
 * Profil-Tab und bleibt bei fünf Zielen — ab sechs klappt iOS auf ein
 * „More"-Menü um und versteckt zwei davon.
 */
export function ScreenHeader({
  title,
  subtitle,
  trailing,
  className,
}: ScreenHeaderProps) {
  return (
    <View className={'flex-row items-start gap-3 ' + (className ?? '')}>
      <View className="flex-1">
        <Text className="t-display">{title}</Text>
        {subtitle !== undefined ? (
          <Text className="t-caption mt-1">{subtitle}</Text>
        ) : null}
      </View>
      {trailing !== undefined ? (
        <View className="pt-0.5">{trailing}</View>
      ) : null}
    </View>
  );
}
