import { ScheduleWidgetContent } from './ScheduleWidgetContent';

type ScheduleFullWidgetProps = { colSpan: number; width: number };

export function ScheduleFullWidget({ width }: ScheduleFullWidgetProps) {
  return <ScheduleWidgetContent colSpan={3} width={width} />;
}
