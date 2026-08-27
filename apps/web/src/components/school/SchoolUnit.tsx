import { BookOpen, CheckCircle2, ChevronRight } from 'lucide-react';
import { pepGrade4UpperUnit1 } from '../../curriculum/pepGrade4UpperUnit1';
import type { CurriculumLesson } from '../../curriculum/types';

export function SchoolUnit({ completedLessonIds, currentLessonId, onOpenLesson }: { completedLessonIds: string[]; currentLessonId: string; onOpenLesson: (lesson: CurriculumLesson) => void }) {
  return <section className="school-unit" aria-labelledby="school-unit-title">
    <header className="school-unit__heading">
      <p className="eyebrow"><BookOpen size={18} /> PEP 四年级上册</p>
      <h2 id="school-unit-title">Unit 1 Helping at home</h2>
      <p>{pepGrade4UpperUnit1.bigQuestion} <span>{pepGrade4UpperUnit1.bigQuestionChinese}</span></p>
      <small>已完成 {completedLessonIds.length}/6 课时</small>
    </header>
    <div className="school-unit__lessons">
      {pepGrade4UpperUnit1.lessons.map(lesson => {
        const completed = completedLessonIds.includes(lesson.id);
        const current = lesson.id === currentLessonId;
        return <article className={current ? 'current' : completed ? 'completed' : ''} key={lesson.id}>
          <div className="school-unit__number">{completed ? <CheckCircle2 size={22} /> : String(lesson.sequence).padStart(2, '0')}</div>
          <div><strong>{lesson.title}</strong><span>{lesson.subtitle} · {lesson.durationMinutes} 分钟</span></div>
          <button type="button" aria-label={`开始第 ${lesson.sequence} 课：${lesson.title}`} onClick={() => onOpenLesson(lesson)}>
            {completed ? '再学一次' : current ? '开始' : '预习'} <ChevronRight size={18} />
          </button>
        </article>;
      })}
    </div>
  </section>;
}
