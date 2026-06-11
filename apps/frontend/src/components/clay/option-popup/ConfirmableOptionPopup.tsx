import { useEffect, useState } from 'react';
import { ConfirmationActions } from './OptionPopupActions';
import { OptionPopupFrame } from './OptionPopupFrame';
import { OptionPopupList } from './OptionPopupList';
import type { OptionPopupVariantProps } from './optionPopupModel';

export function ConfirmableOptionPopup<T extends string>({
  visible,
  title,
  text,
  options,
  selectedValue,
  confirmLabel = 'Confirm',
  onClose,
  onSelect,
}: OptionPopupVariantProps<T>) {
  const [draftValue, setDraftValue] = useState<T | undefined>(selectedValue);

  useEffect(() => {
    if (visible) {
      setDraftValue(selectedValue);
    }
  }, [selectedValue, visible]);

  const confirm = () => {
    if (draftValue === undefined) {
      return;
    }
    onSelect(draftValue);
    onClose();
  };

  return (
    <OptionPopupFrame
      visible={visible}
      title={title}
      text={text}
      footer={
        <ConfirmationActions
          confirmLabel={confirmLabel}
          disabled={draftValue === undefined}
          onClose={onClose}
          onConfirm={confirm}
        />
      }
      onClose={onClose}
    >
      <OptionPopupList
        options={options}
        selectedValue={draftValue}
        onSelect={setDraftValue}
      />
    </OptionPopupFrame>
  );
}
