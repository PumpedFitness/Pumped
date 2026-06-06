import * as React from 'react';

export interface StepperProps {
  /** Caption above the value (e.g. "Weight"). */
  label?: React.ReactNode;
  /** Current numeric value. */
  value: number;
  /** Trailing unit (kg). */
  unit?: React.ReactNode;
  /** Increment per tap. Default 1 (use 2.5 for barbell weight). */
  step?: number;
  onChange?: (next: number) => void;
  /** True (default) styles for a moss well; false for a cream/sunk surface. */
  onMoss?: boolean;
}

/**
 * Minus / value / plus control for adjusting weight or reps while logging a
 * set. Two side-by-side Steppers (weight + reps) make the set editor.
 */
export function Stepper(props: StepperProps): JSX.Element;
