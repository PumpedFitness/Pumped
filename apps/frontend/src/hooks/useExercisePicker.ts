import { useState, useMemo } from 'react';
import { asc, like } from 'drizzle-orm';
import { useRepository } from '../data/local/useRepository';
import { exercises } from '../data/local/schema';
import type { Exercise, MuscleGroup } from '../types/domain';

export function useExercisePicker() {
  const exerciseRepo = useRepository(exercises);
  const [query, setQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | null>(null);

  const results = useMemo(() => {
    let filtered: Exercise[];
    if (query.trim()) {
      filtered = exerciseRepo.query({
        where: like(exercises.name, `%${query}%`),
        orderBy: [asc(exercises.name)],
      });
    } else {
      filtered = exerciseRepo.query({ orderBy: [asc(exercises.name)] });
    }
    if (muscleFilter) {
      filtered = filtered.filter(e => e.muscleGroups.includes(muscleFilter));
    }
    return filtered;
  }, [query, muscleFilter, exerciseRepo]);

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
