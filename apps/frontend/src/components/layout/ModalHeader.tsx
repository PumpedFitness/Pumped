import { ScreenHeader } from './ScreenHeader';

type ModalHeaderProps = {
  title: string;
  rightLabel: string;
  rightDisabled?: boolean;
  onLeftPress: () => void;
  onRightPress: () => void;
};

export function ModalHeader({
  title,
  rightLabel,
  rightDisabled,
  onLeftPress,
  onRightPress,
}: ModalHeaderProps) {
  return (
    <ScreenHeader
      title={title}
      onBack={onLeftPress}
      actionLabel={rightLabel}
      actionDisabled={rightDisabled}
      onAction={onRightPress}
    />
  );
}
