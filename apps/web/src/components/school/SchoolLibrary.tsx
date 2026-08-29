import { BookOpen, CheckCircle2, ChevronRight, Clock3 } from 'lucide-react';
import { getUnitTextbookPages } from '../../curriculum/pepGrade4UpperTextbookPages';
import type { TextbookPage } from '../../curriculum/types';
import { Button } from '../ui/Button';

type Props = { completedPageIds: string[]; currentPageId: string; laterReviewCount: number; onOpenPage: (page: TextbookPage) => void; onOpenExtra?: () => void };

export function SchoolLibrary({ completedPageIds, currentPageId, laterReviewCount, onOpenPage, onOpenExtra }: Props) {
  const pages = getUnitTextbookPages('pep4a-u1');
  const current = pages.find(page => page.id === currentPageId) ?? pages[0];
  return <section className="school-library motion-home__panel" aria-label="校内同步教材">
    <header className="school-library__book"><span>当前教材</span><strong>人教版 PEP 四年级上册</strong><small>Unit 1 · Helping at home · 在家帮忙</small></header>
    <section className="school-library__continue"><div><p>继续学习</p><h2>课本第 {current.printedPage} 页 · {current.chineseTitle}</h2><span>读课本、开口说、小检查，都在这一页完成。</span></div><Button onClick={() => onOpenPage(current)}>开始学习 <ChevronRight size={18} /></Button></section>
    <div className="school-library__metrics"><span><BookOpen size={18} /> 已完成 {completedPageIds.length}/{pages.length} 页</span><span><Clock3 size={18} /> 稍后再学 {laterReviewCount} 条</span></div>
    <section className="school-library__route" aria-labelledby="school-pages-title"><h2 id="school-pages-title">课本页面</h2>{pages.map(page => { const done = completedPageIds.includes(page.id); const active = page.id === current.id; return <button type="button" key={page.id} onClick={() => onOpenPage(page)}><span>{done ? <CheckCircle2 size={20} /> : `第 ${page.printedPage} 页`}</span><div><strong>{page.chineseTitle}</strong><small lang="en">{page.title}</small></div><em>{done ? '已完成' : active ? '正在学习' : '可以学习'} <ChevronRight size={18} /></em></button>; })}</section>
    {onOpenExtra && <aside className="school-library__extra"><div><span>课外辅助</span><strong>动画小故事</strong><small>校内内容学完后，再用动画轻松复习。</small></div><Button variant="secondary" onClick={onOpenExtra}>去课外动画</Button></aside>}
  </section>;
}
