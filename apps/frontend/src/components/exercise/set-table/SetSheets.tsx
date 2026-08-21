import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Keyboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LibraryPicker } from '@pumped/ui/forms/LibraryPicker';
import {
  OptionalWheelPickerSheet,
  type OptionalWheelPickerConfig,
} from '@pumped/ui/forms/OptionalWheelPickerSheet';
import { RangeWheelPickerSheet } from '@pumped/ui/forms/RangeWheelPickerSheet';
import type {
  SetCardModel,
  SetCardNumberField,
  SetCardRangeField,
  SetCardRest,
  SetTypeOption,
} from './exerciseSetTableModel';
import { ProgressionEditorSheet } from './ProgressionEditorSheet';
import { buildRestPickerConfig } from './restPicker';

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
  openRestPicker: (rest: SetCardRest) => void;
};

const NOOP_OPENERS: SetSheetOpeners = {
  openSetTypePicker: () => {},
  openProgressionPicker: () => {},
  openWheel: () => {},
  openRange: () => {},
  openRestPicker: () => {},
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
  rest: SetCardRest | null;
  restOpen: boolean;
  onCloseRest: () => void;
};

type RestPickerSheetProps = {
  rest: SetCardRest | null;
  visible: boolean;
  onClose: () => void;
};

function RestPickerSheet({ rest, visible, onClose }: RestPickerSheetProps) {
  const { t } = useTranslation();
  const config = useMemo(
    () => buildRestPickerConfig(t, rest?.value),
    [rest, t],
  );

  return (
    <OptionalWheelPickerSheet
      visible={visible}
      value={rest?.value ?? null}
      config={config}
      onClose={onClose}
      onChange={value => rest?.onChange(value)}
    />
  );
}

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
  rest,
  restOpen,
  onCloseRest,
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
        value={wheelField?.value ?? wheelField?.suggestedValue ?? null}
        config={wheelField?.wheelConfig ?? WHEEL_PLACEHOLDER}
        onClose={onCloseWheel}
        onChange={value => wheelField?.onChange(value)}
      />

      <RangeWheelPickerSheet
        visible={rangeOpen}
        value={rangeField?.range ?? rangeField?.suggestedRange ?? null}
        config={rangeField?.wheelConfig ?? WHEEL_PLACEHOLDER}
        onClose={onCloseRange}
        onChange={value => rangeField?.onChange(value)}
      />

      <RestPickerSheet rest={rest} visible={restOpen} onClose={onCloseRest} />
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
  const [rest, setRest] = useState<SetCardRest | null>(null);
  const [restOpen, setRestOpen] = useState(false);

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
      openRestPicker: restValue => {
        Keyboard.dismiss();
        const value = restValue.value ?? 90;
        if (restValue.value == null) {
          restValue.onChange(value);
        }
        setRest({ ...restValue, value });
        setRestOpen(true);
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
        rest={rest}
        restOpen={restOpen}
        onCloseRest={() => setRestOpen(false)}
      />
    </SetSheetContext.Provider>
  );
}
