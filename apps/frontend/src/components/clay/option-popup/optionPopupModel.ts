export type PopupOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

export type OptionPopupProps<T extends string> = {
  visible: boolean;
  title: string;
  text: string;
  options: PopupOption<T>[];
  selectedValue?: T;
  needsConfirmation?: boolean;
  confirmLabel?: string;
  onClose: () => void;
  onSelect: (value: T) => void;
};

export type OptionPopupVariantProps<T extends string> = Omit<
  OptionPopupProps<T>,
  'needsConfirmation'
>;
