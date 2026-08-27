import { useState } from 'react';
import { pepGrade4Upper } from '../../curriculum/pepGrade4UpperUnit1';
import type { CurriculumLesson } from '../../curriculum/types';
import { SchoolUnit } from './SchoolUnit';

export function SchoolLibrary({ completedLessonIds, currentLessonId, onOpenLesson }: { completedLessonIds: string[]; currentLessonId: string; onOpenLesson: (lesson: CurriculumLesson) => void }) {
  const [selectedUnitId, setSelectedUnitId] = useState(pepGrade4Upper.currentUnitId);
  const selectedUnit = pepGrade4Upper.units.find(unit => unit.id === selectedUnitId) ?? pepGrade4Upper.units[0];
  return <section className="school-library motion-home__panel" aria-label="校内同步教材">
    <div className="school-library__book">
      <span>当前教材</span>
      <strong>{pepGrade4Upper.title}</strong>
      <small>按教材单元慢慢学，校内进度会单独保存。</small>
    </div>
    <div className="school-library__units" role="tablist" aria-label="选择教材单元">
      {pepGrade4Upper.units.map(unit => <button key={unit.id} type="button" role="tab" aria-selected={unit.id === selectedUnit.id} onClick={() => setSelectedUnitId(unit.id)}>Unit {unit.sequence} {unit.title}</button>)}
    </div>
    <SchoolUnit unit={selectedUnit} completedLessonIds={completedLessonIds} currentLessonId={currentLessonId} onOpenLesson={onOpenLesson} />
  </section>;
}
