import { createContext, useContext } from 'react';
import type { WorkoutTemplateSuperset } from '@/types/workout';
import type { EditorBlock, EditorExercise } from './useEditorExercises';

/**
 * The slice of editor state the exercises subtree needs. Provided once by the
 * editor and read directly by the section and cards via `useTemplateEditor()`,
 * so per-exercise callbacks are never drilled through props.
 */
export type TemplateEditorContextValue = {
  exercises: EditorExercise[];
  /** Standalone exercises and supersets, in render order. */
  blocks: EditorBlock[];
  chooseExercises: () => void;
  editExercise: (exercise: EditorExercise) => void;
  openExerciseOverview: (exercise: EditorExercise) => void;
  /** Reorders whole blocks — a drag must not be able to split a superset. */
  reorderBlocks: (from: number, to: number) => void;
  removeExercise: (exerciseId: string) => void;
  ungroupSuperset: (supersetId: string) => void;
  updateSuperset: (
    supersetId: string,
    patch: Partial<Omit<WorkoutTemplateSuperset, 'id'>>,
  ) => void;
  setSupersetRounds: (supersetId: string, rounds: number) => void;
  moveSupersetMember: (supersetId: string, from: number, to: number) => void;
  /** Cards start folded — a template is mostly read while reordering, and the
   *  set previews are by far the tallest part of each one. Keyed by exercise id
   *  for a card, `superset:<id>` for a whole block. */
  isExpanded: (key: string) => boolean;
  toggleExpanded: (key: string) => void;
};

const TemplateEditorContext = createContext<TemplateEditorContextValue | null>(
  null,
);

export const TemplateEditorProvider = TemplateEditorContext.Provider;

export function useTemplateEditor(): TemplateEditorContextValue {
  const value = useContext(TemplateEditorContext);
  if (!value) {
    throw new Error(
      'useTemplateEditor must be used within a TemplateEditorProvider',
    );
  }
  return value;
}
