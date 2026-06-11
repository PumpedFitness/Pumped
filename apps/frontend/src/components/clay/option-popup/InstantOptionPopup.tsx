import { CancelAction } from './OptionPopupActions';
import { OptionPopupFrame } from './OptionPopupFrame';
import { OptionPopupList } from './OptionPopupList';
import type { OptionPopupVariantProps } from './optionPopupModel';

export function InstantOptionPopup<T extends string>({
  visible,
  title,
  text,
  options,
  selectedValue,
  onClose,
  onSelect,
}: OptionPopupVariantProps<T>) {
  const selectAndClose = (value: T) => {
    onSelect(value);
    onClose();
  };

  return (
    <OptionPopupFrame
      visible={visible}
      title={title}
      text={text}
      footer={<CancelAction onClose={onClose} />}
      onClose={onClose}
    >
      <OptionPopupList
        options={options}
        selectedValue={selectedValue}
        onSelect={selectAndClose}
      />
    </OptionPopupFrame>
  );
}
