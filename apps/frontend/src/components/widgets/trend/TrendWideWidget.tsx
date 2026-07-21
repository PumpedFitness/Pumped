import { TrendWidgetContent } from './TrendWidgetContent';

type TrendWideWidgetProps = { colSpan: number; width: number };

export function TrendWideWidget({ width }: TrendWideWidgetProps) {
  return <TrendWidgetContent colSpan={2} width={width} />;
}
