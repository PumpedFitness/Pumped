import { StreakWidgetContent } from './StreakWidgetContent';

type StreakWideWidgetProps = { colSpan: number; width: number };

export function StreakWideWidget({ width }: StreakWideWidgetProps) {
  return <StreakWidgetContent colSpan={2} width={width} />;
}
