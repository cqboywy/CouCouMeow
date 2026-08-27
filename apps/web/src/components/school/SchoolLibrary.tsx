import { pepGrade4Upper } from '../../curriculum/pepGrade4UpperUnit1';
import type { CurriculumLesson } from '../../curriculum/types';
import { SchoolUnit } from './SchoolUnit';

export function SchoolLibrary({ completedLessonIds, currentLessonId, onOpenLesson }: { completedLessonIds: string[]; currentLessonId: string; onOpenLesson: (lesson: CurriculumLesson) => void }) {
  return <section className="school-library motion-home__panel" aria-label="校内同步教材">
    <div className="school-library__book">
      <span>当前教材</span>
      <strong>{pepGrade4Upper.title}</strong>
      <small>先把 Unit 1 学扎实，再慢慢打开后面的单元。</small>
    </div>
    <SchoolUnit completedLessonIds={completedLessonIds} currentLessonId={currentLessonId} onOpenLesson={onOpenLesson} />
  </section>;
}
