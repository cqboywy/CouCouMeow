import { ChevronRight } from 'lucide-react';
import type { CurriculumLesson } from '../../curriculum/types';
import { Button } from '../ui/Button';

export function SchoolToday({ lesson, completedCount, onStart }: { lesson: CurriculumLesson; completedCount: number; onStart: () => void }) {
  return <div className="motion-home__hero school-today">
    <h2 className="motion-heading">今天，把课本学轻松一点</h2>
    <div className="motion-episode school-today__book">
      <span>PEP 四年级上册 · Unit 1</span>
      <strong>{lesson.title}</strong>
    </div>
    <p className="school-today__meta">约 {lesson.durationMinutes} 分钟 · 已完成 {completedCount}/6 课时</p>
    <Button aria-label={`开始校内学习 ${lesson.title}`} onClick={onStart}>开始校内学习 <ChevronRight size={20} /></Button>
  </div>;
}
