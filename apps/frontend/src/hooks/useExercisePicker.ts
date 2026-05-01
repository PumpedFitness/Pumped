import {useState, useMemo} from 'react';
import {useExerciseStore} from '../stores/exerciseStore';
import type {Exercise, MuscleGroup} from '../types/domain';

export function useExercisePicker() {
  const exercises = useExerciseStore((s) => s.exercises);
  const searchExercises = useExerciseStore((s) => s.searchExercises);
  const [query, setQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | null>(null);

  const results = useMemo(() => {
    let filtered: Exercise[];
    if (query.trim()) {
      filtered = searchExercises(query);
    } else {
      filtered = exercises;
    }
    if (muscleFilter) {
      filtered = filtered.filter((e) => e.muscleGroups.includes(muscleFilter));
    }
    return filtered;
  }, [query, muscleFilter, exercises, searchExercises]);

  const grouped = useMemo(() => {
    const groups = new Map<MuscleGroup, Exercise[]>();
    for (const exercise of results) {
      for (const mg of exercise.muscleGroups) {
        const list = groups.get(mg) ?? [];
        list.push(exercise);
        groups.set(mg, list);
      }
    }
    return groups;
  }, [results]);

  return {
    query,
    setQuery,
    muscleFilter,
    setMuscleFilter,
    results,
    grouped,
  };
}
