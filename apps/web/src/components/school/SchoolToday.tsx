import { ChevronRight } from 'lucide-react';
import type { TextbookPage } from '../../curriculum/types';
import { Button } from '../ui/Button';

export function SchoolToday({ page, completedCount, onStart }: { page: TextbookPage; completedCount: number; onStart: () => void }) {
  return <div className="motion-home__hero school-today">
    <h2 className="motion-heading">今天，把课本学轻松一点</h2>
    <div className="motion-episode school-today__book">
      <span>PEP 四年级上册 · Unit 1</span>
      <strong>课本第 {page.printedPage} 页 · {page.chineseTitle}</strong>
    </div>
    <p className="school-today__meta">读一读、说一说，再做一个小检查 · 已完成 {completedCount}/2 页</p>
    <Button aria-label={`开始校内学习 课本第 ${page.printedPage} 页`} onClick={onStart}>开始学习 <ChevronRight size={20} /></Button>
  </div>;
}
