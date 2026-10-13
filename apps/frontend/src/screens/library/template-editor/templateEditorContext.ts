import { createContext, useContext } from 'react';
import type { EditableExercise } from '@/types/exercise';
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
  openExerciseOverview: (exercise: EditorExercise) => void;
  updateExercise: (
    exerciseId: string,
    update: (exercise: EditableExercise) => EditableExercise,
  ) => void;
  /** Reorders whole blocks — a drag must not be able to split a superset. */
  reorderBlocks: (from: number, to: number) => void;
  removeExercise: (exerciseId: string) => void;
  ungroupSuperset: (supersetId: string) => void;
  moveSupersetMember: (supersetId: string, from: number, to: number) => void;
  allowImport: boolean;
  /** Supersets can still fold as one block while their exercise sections stay
   *  fully expanded. */
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
