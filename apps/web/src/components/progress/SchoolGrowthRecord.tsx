import { BookOpen, CalendarDays } from 'lucide-react';
import { useState } from 'react';
import type { SchoolMasteryItem, SchoolProgressSummary } from '../../progress/schoolProgressSummary';
import { useContent } from '../../content/ContentProvider';
import { Button } from '../ui/Button';
import { Surface } from '../ui/Surface';

type Category = 'words' | 'sentences' | 'phonics';
const labels: Record<Category, string> = { words: '单词', sentences: '句子', phonics: '拼读' };
const shortDay = (day: string) => new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(new Date(`${day}T12:00:00`));
const longDay = (day: string) => new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric' }).format(new Date(`${day}T12:00:00`));

const formatItemLocation = (item: SchoolMasteryItem, content: ReturnType<typeof useContent>) => {
  const page = content.getPage(item.lessonId);
  if (page) return `课本第 ${page.printedPage} 页 · ${page.chineseTitle}`;
  const lesson = content.getLesson(item.lessonId);
  const unit = lesson ? content.getUnit(lesson.unitId) : undefined;
  return unit && lesson ? `Unit ${unit.sequence} · ${unit.title} · 第 ${lesson.sequence} 课` : '校内同步教材';
};

export function SchoolGrowthRecord({ summary, onStartLearning }: { summary: SchoolProgressSummary; onStartLearning: () => void }) {
  const content = useContent();
  const itemLocation = (item: SchoolMasteryItem) => formatItemLocation(item, content);
  const [selectedDay, setSelectedDay] = useState(summary.days[0]?.day ?? summary.masteredItems[0]?.firstLearnedDay ?? '');
  const [category, setCategory] = useState<Category>('words');
  const items = {
    words: summary.masteredItems.filter(item => item.kind === 'word'),
    sentences: summary.masteredItems.filter(item => item.kind === 'sentence'),
    phonics: summary.masteredItems.filter(item => item.kind === 'phonics'),
  };
  const days = summary.days;
  const activeDay = days.find(day => day.day === selectedDay) ?? days[0];
  const dayItems = summary.masteredItems.filter(item => item.firstLearnedDay === activeDay?.day);
  const dayGroups = [
    { label: '单词', items: dayItems.filter(item => item.kind === 'word') },
    { label: '句子', items: dayItems.filter(item => item.kind === 'sentence') },
    { label: '拼读', items: dayItems.filter(item => item.kind === 'phonics') },
  ].filter(group => group.items.length);
  return <div className="school-growth">
    <div className="school-growth__stats growth-summary">
      <Surface className="stat"><strong>{summary.completedPageIds.length}<small>页</small></strong><span>已完成页面</span></Surface>
      <Surface className="stat"><strong>{items.words.length}<small>个</small></strong><span>教材单词</span></Surface>
      <Surface className="stat"><strong>{items.sentences.length}<small>句</small></strong><span>核心句子</span></Surface>
      <Surface className="stat"><strong>{summary.practiceCount}<small>次</small></strong><span>累计练习</span></Surface>
    </div>
    <Surface className="growth-days school-growth__days">
      <div className="growth-days__heading"><div><p className="eyebrow"><CalendarDays size={18} /> 这一周的小脚印</p><h3>{activeDay ? `${shortDay(activeDay.day)} 收下了 ${dayItems.length} 个新收获` : '还没有学习足迹'}</h3></div></div>
      {days.length ? <><div className="growth-days__tabs" role="tablist" aria-label="选择校内学习日期">{days.map(day => <button key={day.day} type="button" role="tab" aria-selected={day.day === activeDay?.day} onClick={() => setSelectedDay(day.day)}><span>{shortDay(day.day)}</span><strong>{day.practiceCount || '—'}</strong></button>)}</div><p className="growth-days__detail" aria-live="polite">新单词 {dayGroups.find(group => group.label === '单词')?.items.length ?? 0} 个 · 新句子 {dayGroups.find(group => group.label === '句子')?.items.length ?? 0} 句 · 完成页面 {activeDay?.completedPageCount ?? 0} 页</p>{dayItems.length ? <div className="growth-day-items"><h4>{longDay(activeDay!.day)}学会了这些</h4>{dayGroups.map(group => <section key={group.label}><strong>{group.label}</strong><div>{group.items.map(item => <span key={item.id}><b lang="en">{item.english}</b><small>{item.chinese}</small></span>)}</div></section>)}</div> : <p className="growth-days__empty">这一天还没有新的校内学习内容。</p>}</> : <div className="growth-empty"><p>完成一页课本后，这里会留下第一枚小脚印。</p><Button onClick={onStartLearning}>开始校内学习</Button></div>}
    </Surface>
    <Surface className="growth-collection school-growth__collection"><p className="eyebrow"><BookOpen size={18} /> MY SCHOOL COLLECTION</p><h3>我学会的内容</h3>{summary.masteredItems.length ? <><div className="growth-collection__tabs" role="tablist" aria-label="校内学习收藏分类">{(Object.keys(labels) as Category[]).map(key => <button key={key} type="button" role="tab" aria-selected={category === key} onClick={() => setCategory(key)}>{labels[key]} <small>{items[key].length}</small></button>)}</div>{items[category].length ? <div className="growth-items">{items[category].map(item => <article key={item.id}><div><strong lang="en">{item.english}</strong><span>{item.chinese}</span></div><small>{itemLocation(item)}</small></article>)}</div> : <p className="growth-days__empty">这一类内容还没有收获。</p>}</> : <div className="growth-empty"><p>这里还没有校内小收获，去完成今天的一页课本吧。</p><Button onClick={onStartLearning}>开始校内学习</Button></div>}</Surface>
  </div>;
}
