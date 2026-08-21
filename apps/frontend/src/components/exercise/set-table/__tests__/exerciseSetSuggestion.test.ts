import type { SetTypeFieldDef, SetTypeFieldConfig } from '@/types/setType';
import type { SetFieldValue } from '@/types/workout';
import {
  fillEmptyFieldsFromSuggestion,
  type SuggestedSetValues,
} from '../exerciseSetSuggestion';

function field(
  id: string,
  dataType: SetTypeFieldDef['dataType'],
  unit: SetTypeFieldDef['unit'],
  config: SetTypeFieldConfig = { required: true },
): SetTypeFieldDef {
  return {
    id,
    setTypeId: 'normal',
    name: id,
    dataType,
    unit,
    position: 0,
    config,
  };
}

const WEIGHT = field('weight', 'number', 'amount');
const REPS = field('reps', 'number', null);

function suggests(values: Record<string, number>): SuggestedSetValues {
  return {
    fieldSuggestions: Object.entries(values).map(([fieldId, value]) => ({
      fieldId,
      value,
      displayValue: String(value),
    })),
  };
}

function numberOf(values: SetFieldValue[], fieldId: string): number | null {
  return values.find(value => value.fieldId === fieldId)?.number ?? null;
}

describe('fillEmptyFieldsFromSuggestion', () => {
  it('fills every empty field the suggestion covers', () => {
    const filled = fillEmptyFieldsFromSuggestion(
      [WEIGHT, REPS],
      [],
      suggests({ weight: 60, reps: 5 }),
      'kg',
    );

    expect(numberOf(filled, 'weight')).toBe(60);
    expect(numberOf(filled, 'reps')).toBe(5);
  });

  it('fills both fields off one pass — the second must not clobber the first', () => {
    const filled = fillEmptyFieldsFromSuggestion(
      [WEIGHT, REPS],
      [],
      suggests({ weight: 60, reps: 5 }),
      'kg',
    );

    expect(filled).toHaveLength(2);
  });

  it('never overwrites what the user typed', () => {
    const typed: SetFieldValue[] = [{ fieldId: 'weight', number: 72.5 }];

    const filled = fillEmptyFieldsFromSuggestion(
      [WEIGHT, REPS],
      typed,
      suggests({ weight: 60, reps: 5 }),
      'kg',
    );

    expect(numberOf(filled, 'weight')).toBe(72.5);
    expect(numberOf(filled, 'reps')).toBe(5);
  });

  it('writes the value the card displays, not the raw suggestion', () => {
    // The placeholder an lbs user reads is the converted number, and typing it
    // by hand would store exactly that. Filling has to match keystroke for
    // keystroke or the two ways of logging a set disagree.
    const filled = fillEmptyFieldsFromSuggestion(
      [WEIGHT],
      [],
      suggests({ weight: 60 }),
      'lbs',
    );

    expect(numberOf(filled, 'weight')).toBeCloseTo(132.3, 1);
  });

  it('leaves a suggestion the field itself would reject', () => {
    const bounded = field('rpe', 'number', null, {
      required: true,
      min: 1,
      max: 10,
      step: 0.5,
    });

    const filled = fillEmptyFieldsFromSuggestion(
      [bounded],
      [],
      suggests({ rpe: 40 }),
      'kg',
    );

    expect(numberOf(filled, 'rpe')).toBeNull();
  });

  it('returns the same array when there is nothing to fill', () => {
    const values: SetFieldValue[] = [{ fieldId: 'reps', number: 5 }];

    expect(
      fillEmptyFieldsFromSuggestion(
        [REPS],
        values,
        suggests({ reps: 8 }),
        'kg',
      ),
    ).toBe(values);
    expect(fillEmptyFieldsFromSuggestion([REPS], values, undefined, 'kg')).toBe(
      values,
    );
  });
});
