import { ConfirmableOptionPopup } from './ConfirmableOptionPopup';
import { InstantOptionPopup } from './InstantOptionPopup';
import type { OptionPopupProps } from './optionPopupModel';

export function OptionPopup<T extends string>({
  needsConfirmation = false,
  ...props
}: OptionPopupProps<T>) {
  if (needsConfirmation) {
    return <ConfirmableOptionPopup {...props} />;
  }
  return <InstantOptionPopup {...props} />;
}
