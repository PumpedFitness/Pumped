import { createContext, useContext } from 'react';
import type { EditorExercise } from './useEditorExercises';

/**
 * The slice of editor state the exercises subtree needs. Provided once by the
 * editor and read directly by the section and cards via `useTemplateEditor()`,
 * so per-exercise callbacks are never drilled through props.
 */
export type TemplateEditorContextValue = {
  exercises: EditorExercise[];
  chooseExercises: () => void;
  editExercise: (exercise: EditorExercise) => void;
  openExerciseOverview: (exercise: EditorExercise) => void;
  reorderExercises: (from: number, to: number) => void;
  removeExercise: (exerciseId: string) => void;
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
