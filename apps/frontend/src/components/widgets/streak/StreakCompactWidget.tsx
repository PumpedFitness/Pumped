import { StreakWidgetContent } from './StreakWidgetContent';

type StreakCompactWidgetProps = { colSpan: number; width: number };

export function StreakCompactWidget({ width }: StreakCompactWidgetProps) {
  return <StreakWidgetContent colSpan={1} width={width} />;
}
