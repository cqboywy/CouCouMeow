import { BookOpen, CalendarDays, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';
import type { GrowthSummary, MasteryItem } from '../../progress/extraProgressSummary';
import type { LearningItem } from '../../progress/learningEvents';
import { Button } from '../ui/Button';
import { Surface } from '../ui/Surface';

type Category = 'words' | 'sentences' | 'patterns' | 'episodes';
const labels: Record<Category, string> = { words: '单词', sentences: '句子', patterns: '句式', episodes: '已完成剧集' };
const shortDay = (day: string) => new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(new Date(`${day}T12:00:00`));
const longDay = (day: string) => new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric' }).format(new Date(`${day}T12:00:00`));
const familiarity = (item: MasteryItem) => item.correctCount >= 3 ? '越来越熟啦' : item.correctCount >= 2 ? '再练一次就更棒' : '刚认识的新朋友';
const dayGroups = (day: GrowthSummary['today']) => [
  { label: '单词', items: day.newWords },
  { label: '句子', items: day.newSentences },
  { label: '句式', items: day.newPatterns },
  { label: '剧集', items: day.newEpisodes },
].filter(group => group.items.length);

export function GrowthRecord({ summary, onStartLearning, onReviewItem }: { summary: GrowthSummary; onStartLearning: () => void; onReviewItem?: (item: LearningItem) => void }) {
  const [selectedDay, setSelectedDay] = useState(summary.days[0]?.day ?? summary.today.day);
  const [category, setCategory] = useState<Category>('words');
  const collectionRef = useRef<HTMLDivElement>(null);
  const day = summary.days.find(item => item.day === selectedDay) ?? summary.today;
  const items = summary.items[category];
  const newCount = day.newWords.length + day.newSentences.length + day.newPatterns.length + day.newEpisodes.length;
  const scrollToCollection = () => { const node = collectionRef.current; if (typeof node?.scrollIntoView === 'function') node.scrollIntoView({ block: 'start' }); };
  const openCollection = (next: Category) => { setCategory(next); scrollToCollection(); };
  return <section className="growth-record" aria-labelledby="growth-title">
    <div className="section-heading"><p className="eyebrow"><Sparkles size={18}/> MY LITTLE STEPS</p><h2 id="growth-title">我的成长记录</h2><p>每天收下一点点，会慢慢变成很大的进步。</p></div>
    <div className="growth-summary"><button className="surface stat growth-summary__card" type="button" aria-label="查看已学剧集清单" onClick={() => openCollection('episodes')}><strong>{summary.items.episodes.length}<small>集</small></strong><span>已学剧集</span></button><button className="surface stat growth-summary__card" type="button" aria-label="查看已学单词清单" onClick={() => openCollection('words')}><strong>{summary.items.words.length}<small>个</small></strong><span>学会单词</span></button><button className="surface stat growth-summary__card" type="button" aria-label="查看已学句子清单" onClick={() => openCollection('sentences')}><strong>{summary.items.sentences.length}<small>句</small></strong><span>学会句子</span></button><button className="surface stat growth-summary__card" type="button" aria-label="查看今天练习详情" onClick={scrollToCollection}><strong>{summary.today.practiceCount}<small>次</small></strong><span>今天练习</span></button></div>
    {summary.reviewItems.length > 0 && <Surface className="growth-review"><p className="eyebrow"><Sparkles size={18}/> TODAY'S LITTLE REVIEW</p><h3>今天再抱抱这些小难题</h3><p>刚才没有答对也没关系，点一题就从那里再试一次。</p><div>{summary.reviewItems.map(item => <button key={item.id} type="button" onClick={() => onReviewItem?.(item)} aria-label={`复习：${item.english}`}><strong lang="en">{item.english}</strong><small>{item.chinese}</small></button>)}</div><Button variant="secondary" onClick={() => onReviewItem?.(summary.reviewItems[0])}>从第一道错题开始</Button></Surface>}
    <Surface className="growth-days"><div className="growth-days__heading"><div><p className="eyebrow"><CalendarDays size={18}/> 这一周的小脚印</p><h3>{shortDay(day.day)} 收下了 {newCount} 个新收获</h3></div></div><div className="growth-days__tabs" role="tablist" aria-label="选择学习日期">{summary.days.map(item => <button key={item.day} role="tab" aria-selected={item.day === selectedDay} aria-label={`查看 ${item.day} 的学习`} onClick={() => setSelectedDay(item.day)}><span>{shortDay(item.day)}</span><strong>{item.practiceCount || '—'}</strong></button>)}</div><p className="growth-days__detail" aria-live="polite">新单词 {day.newWords.length} 个 · 新句子 {day.newSentences.length} 句 · 新句式 {day.newPatterns.length} 个</p>{newCount > 0 ? <div className="growth-day-items" aria-label={`${longDay(day.day)} 学习内容`}><h4>{longDay(day.day)}学会了这些</h4>{dayGroups(day).map(group => <section key={group.label}><strong>{group.label}</strong><div>{group.items.map(item => <span key={item.id}><b lang="en">{item.english}</b><small>{item.chinese}</small></span>)}</div></section>)}</div> : <p className="growth-days__empty">这一天还没有新的学习内容。</p>}</Surface>
    <div ref={collectionRef}><Surface className="growth-collection"><div className="growth-collection__heading"><div><p className="eyebrow"><BookOpen size={18}/> MY LEARNING COLLECTION</p><h3>我学会的内容</h3></div></div><div className="growth-collection__tabs" role="tablist" aria-label="学习收藏分类">{(Object.keys(labels) as Category[]).map(key => <button key={key} role="tab" aria-selected={category === key} onClick={() => setCategory(key)}>{labels[key]} <small>{summary.items[key].length}</small></button>)}</div>{items.length ? <div className="growth-items">{items.map(item => <article key={item.id}><div><strong lang="en">{item.english}</strong><span>{item.chinese}</span></div><small>学会于 {shortDay(item.firstLearnedDay)} · {familiarity(item)}</small></article>)}</div> : <div className="growth-empty"><p>这里还没有小收获，去完成今天的一小步吧。</p><Button onClick={onStartLearning}>开始今天的学习</Button></div>}</Surface></div>
  </section>;
}
