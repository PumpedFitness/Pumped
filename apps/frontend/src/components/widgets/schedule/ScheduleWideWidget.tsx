import { ScheduleWidgetContent } from './ScheduleWidgetContent';

type ScheduleWideWidgetProps = { colSpan: number; width: number };

export function ScheduleWideWidget({ width }: ScheduleWideWidgetProps) {
  return <ScheduleWidgetContent colSpan={2} width={width} />;
}
