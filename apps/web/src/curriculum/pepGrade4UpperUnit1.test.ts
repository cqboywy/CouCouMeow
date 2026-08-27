import { describe, expect, it } from 'vitest';
import { getLessonById, pepGrade4Upper, pepGrade4UpperUnit1, pepGrade4UpperUnit2 } from './pepGrade4UpperUnit1';

describe('PEP Grade 4 upper Unit 1 curriculum', () => {
  it('provides six ordered lessons that each complete the same simple three-step flow', () => {
    expect(pepGrade4Upper.currentUnitId).toBe('pep4a-u1');
    expect(pepGrade4UpperUnit1.lessons).toHaveLength(6);
    expect(pepGrade4UpperUnit1.lessons.map(lesson => lesson.sequence)).toEqual([1, 2, 3, 4, 5, 6]);

    for (const lesson of pepGrade4UpperUnit1.lessons) {
      expect(lesson.steps.map(step => step.kind)).toEqual(['learn', 'practice', 'check']);
      expect(lesson.pageReferences.length).toBeGreaterThan(0);
      expect(lesson.exercises.length).toBeGreaterThan(0);
      expect(lesson.exercises.every(exercise => exercise.answer.trim().length > 0)).toBe(true);
    }
  });

  it('covers the jobs, helping-at-home, and ch phonics objectives from the unit', () => {
    expect(pepGrade4UpperUnit1.objectives.map(objective => objective.id)).toEqual([
      'pep4a-u1-objective-jobs',
      'pep4a-u1-objective-family',
      'pep4a-u1-objective-help',
      'pep4a-u1-objective-ch',
    ]);
    expect(getLessonById('pep4a-u1-l3')?.phonics.map(item => item.english)).toEqual(
      expect.arrayContaining(['Chinese', 'chair', 'child', 'lunch']),
    );
  });

  it('includes Unit 2 My friends as six ready-to-practice lessons', () => {
    expect(pepGrade4Upper.units.map(unit => unit.title)).toEqual(['Helping at home', 'My friends']);
    expect(pepGrade4UpperUnit2.lessons).toHaveLength(6);
    expect(pepGrade4UpperUnit2.lessons[0]?.pageReferences).toEqual([14, 15]);
    expect(getLessonById('pep4a-u2-l4')?.title).toBe('我和好朋友一起做什么');
    expect(pepGrade4UpperUnit2.lessons.every(lesson => lesson.exercises.filter(item => item.stage === 'practice').length === 2)).toBe(true);
    expect(pepGrade4UpperUnit2.lessons.every(lesson => lesson.exercises.filter(item => item.stage === 'check').length === 2)).toBe(true);
  });
});
