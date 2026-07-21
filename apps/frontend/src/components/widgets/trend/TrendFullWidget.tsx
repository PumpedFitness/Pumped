import { TrendWidgetContent } from './TrendWidgetContent';

type TrendFullWidgetProps = { colSpan: number; width: number };

export function TrendFullWidget({ width }: TrendFullWidgetProps) {
  return <TrendWidgetContent colSpan={3} width={width} />;
}
