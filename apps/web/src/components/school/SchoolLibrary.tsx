import { BookOpen, CheckCircle2, ChevronRight, Clock3 } from 'lucide-react';
import { useState } from 'react';
import { getUnitTextbookPages } from '../../curriculum/pepGrade4UpperTextbookPages';
import { pepGrade4UpperTextbookUnits } from '../../curriculum/pepGrade4UpperTextbookStructure';
import type { TextbookPage } from '../../curriculum/types';
import type { SchoolLaterReviewItem } from '../../progress/schoolProgressRepository';
import { Button } from '../ui/Button';

type Props = { completedPageIds: string[]; currentPageId: string; laterReviewItems: SchoolLaterReviewItem[]; onOpenPage: (page: TextbookPage) => void; onOpenExtra?: () => void };

export function SchoolLibrary({ completedPageIds, currentPageId, laterReviewItems, onOpenPage, onOpenExtra }: Props) {
  const currentPage = pepGrade4UpperTextbookUnits.flatMap(unit => getUnitTextbookPages(unit.id)).find(page => page.id === currentPageId);
  const [selectedUnitId, setSelectedUnitId] = useState(currentPage?.unitId ?? 'pep4a-u1');
  const unit = pepGrade4UpperTextbookUnits.find(item => item.id === selectedUnitId) ?? pepGrade4UpperTextbookUnits[0];
  const pages = getUnitTextbookPages(unit.id);
  const current = pages.find(page => page.id === currentPageId) ?? pages.find(page => !completedPageIds.includes(page.id)) ?? pages[0];
  const laterReviewCount = laterReviewItems.filter(item => pages.some(page => page.id === item.pageId)).length;
  return <section className="school-library motion-home__panel" aria-label="校内同步教材">
    <header className="school-library__book"><span>当前教材</span><strong>人教版 PEP 四年级上册</strong><small>六个单元，按课本页码慢慢学。</small></header>
    <section className="school-library__units" aria-label="教材单元">{pepGrade4UpperTextbookUnits.map(item => <button type="button" key={item.id} aria-pressed={item.id === unit.id} onClick={() => setSelectedUnitId(item.id)}>Unit {item.sequence} · {item.title}<small>{item.chineseTitle} · 第 {item.firstPage}–{item.lastPage} 页</small></button>)}</section>
    {pages.length ? <><section className="school-library__continue"><div><p>Unit {unit.sequence} · {unit.chineseTitle}</p><h2>继续学习 · 课本第 {current.printedPage} 页</h2><span>读课本、开口说、小检查，都在这一页完成。</span></div><Button onClick={() => onOpenPage(current)}>开始学习 <ChevronRight size={18} /></Button></section><div className="school-library__metrics"><span><BookOpen size={18} /> 本单元已完成 {completedPageIds.filter(id => pages.some(page => page.id === id)).length}/{pages.length} 页</span><span><Clock3 size={18} /> 稍后再学 {laterReviewCount} 条</span></div><section className="school-library__route" aria-labelledby="school-pages-title"><h2 id="school-pages-title">{unit.modules.join(' · ')}</h2>{pages.map(page => { const done = completedPageIds.includes(page.id); const active = page.id === current.id; return <button type="button" key={page.id} onClick={() => onOpenPage(page)}><span>{done ? <CheckCircle2 size={20} /> : `第 ${page.printedPage} 页`}</span><div><strong>{page.chineseTitle}</strong><small lang="en">{page.title}</small></div><em>{done ? '已完成' : active ? '正在学习' : '可以学习'} <ChevronRight size={18} /></em></button>; })}</section></> : <section className="school-library__continue"><div><p>Unit {unit.sequence} · {unit.chineseTitle}</p><h2>这个单元正在整理</h2><span>会按课本第 {unit.firstPage}–{unit.lastPage} 页逐页加入，不显示空练习。</span></div></section>}
    {onOpenExtra && <aside className="school-library__extra"><div><span>课外辅助</span><strong>动画小故事</strong><small>校内内容学完后，再用动画轻松复习。</small></div><Button variant="secondary" onClick={onOpenExtra}>去课外动画</Button></aside>}
  </section>;
}
