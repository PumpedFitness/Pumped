import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Keyboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LibraryPicker } from '@/components/forms/LibraryPicker';
import {
  OptionalWheelPickerSheet,
  type OptionalWheelPickerConfig,
} from '@/components/forms/OptionalWheelPickerSheet';
import { RangeWheelPickerSheet } from '@/components/forms/RangeWheelPickerSheet';
import type {
  SetCardModel,
  SetCardNumberField,
  SetCardRangeField,
  SetTypeOption,
} from './exerciseSetTableModel';
import { ProgressionEditorSheet } from './ProgressionEditorSheet';

// Stand-in config so the wheel sheets can render before anything is selected —
// they're always mounted (heroui needs a sheet mounted to present it), and a
// 1-value config keeps the closed sheet near-free.
const WHEEL_PLACEHOLDER: OptionalWheelPickerConfig = {
  title: '',
  description: '',
  minValue: 0,
  maxValue: 0,
  step: 1,
  defaultValue: 0,
  formatValue: value => `${value}`,
};

export type SetSheetOpeners = {
  openSetTypePicker: (card: SetCardModel) => void;
  openProgressionPicker: (card: SetCardModel) => void;
  openWheel: (field: SetCardNumberField) => void;
  openRange: (field: SetCardRangeField) => void;
};

const NOOP_OPENERS: SetSheetOpeners = {
  openSetTypePicker: () => {},
  openProgressionPicker: () => {},
  openWheel: () => {},
  openRange: () => {},
};

const SetSheetContext = createContext<SetSheetOpeners>(NOOP_OPENERS);

/** Opens the shared set-table sheets. Returns no-ops outside a host (read-only
 *  tables never open anything). */
export function useSetSheetOpeners(): SetSheetOpeners {
  return useContext(SetSheetContext);
}

type SetSheetsProps = {
  setTypeCard: SetCardModel | null;
  setTypeOpen: boolean;
  onCloseSetType: () => void;
  progressionCard: SetCardModel | null;
  progressionOpen: boolean;
  onCloseProgression: () => void;
  libraryItems: { id: string; name: string }[];
  onCreateSetType?: (name: string) => string;
  wheelField: SetCardNumberField | null;
  wheelOpen: boolean;
  onCloseWheel: () => void;
  rangeField: SetCardRangeField | null;
  rangeOpen: boolean;
  onCloseRange: () => void;
};

function SetSheets({
  setTypeCard,
  setTypeOpen,
  onCloseSetType,
  progressionCard,
  progressionOpen,
  onCloseProgression,
  libraryItems,
  onCreateSetType,
  wheelField,
  wheelOpen,
  onCloseWheel,
  rangeField,
  rangeOpen,
  onCloseRange,
}: SetSheetsProps) {
  const { t } = useTranslation();
  return (
    <>
      <LibraryPicker
        visible={setTypeOpen}
        title={t('setTable.setTypePickerTitle')}
        items={libraryItems}
        selectedIds={setTypeCard ? [setTypeCard.setType] : []}
        onClose={onCloseSetType}
        onChange={ids => {
          const [id] = ids;
          if (id && setTypeCard) {
            setTypeCard.onSetTypeChange(id);
          }
        }}
        onCreate={onCreateSetType ?? (() => setTypeCard?.setType ?? 'NORMAL')}
      />

      <ProgressionEditorSheet
        card={progressionCard}
        visible={progressionOpen}
        onClose={onCloseProgression}
      />

      <OptionalWheelPickerSheet
        visible={wheelOpen}
        value={wheelField?.value ?? null}
        config={wheelField?.wheelConfig ?? WHEEL_PLACEHOLDER}
        onClose={onCloseWheel}
        onChange={value => wheelField?.onChange(value)}
      />

      <RangeWheelPickerSheet
        visible={rangeOpen}
        value={rangeField?.range ?? null}
        config={rangeField?.wheelConfig ?? WHEEL_PLACEHOLDER}
        onClose={onCloseRange}
        onChange={value => rangeField?.onChange(value)}
      />
    </>
  );
}

type SetSheetHostProps = {
  setTypeOptions: SetTypeOption[];
  onCreateSetType?: (name: string) => string;
  children: ReactNode;
};

/**
 * One shared set of sheets for the whole screen, mounted ONCE (heroui needs a
 * sheet mounted to present it) and reused for every set in every exercise — so
 * starting a workout mounts 3 sheets, not ~2 per set. The active card/field is
 * captured at open time; a sheet commits once (on Apply) and the modal blocks
 * edits to the row underneath, so the captured handler can't go stale.
 */
export function SetSheetHost({
  setTypeOptions,
  onCreateSetType,
  children,
}: SetSheetHostProps) {
  const [setTypeCard, setSetTypeCard] = useState<SetCardModel | null>(null);
  const [setTypeOpen, setSetTypeOpen] = useState(false);
  const [progressionCard, setProgressionCard] = useState<SetCardModel | null>(
    null,
  );
  const [progressionOpen, setProgressionOpen] = useState(false);
  const [wheelField, setWheelField] = useState<SetCardNumberField | null>(null);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [rangeField, setRangeField] = useState<SetCardRangeField | null>(null);
  const [rangeOpen, setRangeOpen] = useState(false);

  const openers = useMemo<SetSheetOpeners>(
    () => ({
      openSetTypePicker: card => {
        Keyboard.dismiss();
        setSetTypeCard(card);
        setSetTypeOpen(true);
      },
      openProgressionPicker: card => {
        Keyboard.dismiss();
        setProgressionCard(card);
        setProgressionOpen(true);
      },
      openWheel: field => {
        Keyboard.dismiss();
        setWheelField(field);
        setWheelOpen(true);
      },
      openRange: field => {
        Keyboard.dismiss();
        setRangeField(field);
        setRangeOpen(true);
      },
    }),
    [],
  );

  const libraryItems = useMemo(
    () =>
      setTypeOptions.map(option => ({ id: option.value, name: option.label })),
    [setTypeOptions],
  );

  return (
    <SetSheetContext.Provider value={openers}>
      {children}

      <SetSheets
        setTypeCard={setTypeCard}
        setTypeOpen={setTypeOpen}
        onCloseSetType={() => setSetTypeOpen(false)}
        progressionCard={progressionCard}
        progressionOpen={progressionOpen}
        onCloseProgression={() => setProgressionOpen(false)}
        libraryItems={libraryItems}
        onCreateSetType={onCreateSetType}
        wheelField={wheelField}
        wheelOpen={wheelOpen}
        onCloseWheel={() => setWheelOpen(false)}
        rangeField={rangeField}
        rangeOpen={rangeOpen}
        onCloseRange={() => setRangeOpen(false)}
      />
    </SetSheetContext.Provider>
  );
}
