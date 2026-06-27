export type ProgressionFieldSuggestion = {
  fieldId?: string;
  value: number | string;
  displayValue: string;
};

export type ProgressionSuggestedSet = {
  weightKg?: number;
  reps?: number;
  durationSeconds?: number;
  fieldSuggestions?: ProgressionFieldSuggestion[];
  displayText?: string;
  lastPerformedText?: string;
  isLastPerformanceOnly?: boolean;
};

export type ProgressionSuggestionResult = {
  kind: 'suggestion' | 'last_performed' | 'none';
  fieldSuggestions: ProgressionFieldSuggestion[];
  suggestedWeightKg?: number;
  suggestedReps?: number;
  suggestedSets: ProgressionSuggestedSet[];
  displayText?: string;
  lastPerformedText?: string;
  reason?: string;
  hasSuggestion: boolean;
  isLastPerformanceOnly: boolean;
  missingRequirement?:
    | 'last_performance'
    | 'manual_target'
    | 'incompatible_goal';
};
