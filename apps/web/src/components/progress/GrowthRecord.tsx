import { BookOpen, CalendarDays, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { GrowthSummary, MasteryItem } from '../../progress/localProgressRepository';
import { Button } from '../ui/Button';
import { Surface } from '../ui/Surface';

type Category = 'words' | 'sentences' | 'patterns' | 'episodes';
const labels: Record<Category, string> = { words: '单词', sentences: '句子', patterns: '句式', episodes: '已完成剧集' };
const shortDay = (day: string) => new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(new Date(`${day}T12:00:00`));
const familiarity = (item: MasteryItem) => item.correctCount >= 3 ? '越来越熟啦' : item.correctCount >= 2 ? '再练一次就更棒' : '刚认识的新朋友';

export function GrowthRecord({ summary, onStartLearning }: { summary: GrowthSummary; onStartLearning: () => void }) {
  const [selectedDay, setSelectedDay] = useState(summary.days[0]?.day ?? summary.today.day);
  const [category, setCategory] = useState<Category>('words');
  const day = summary.days.find(item => item.day === selectedDay) ?? summary.today;
  const items = summary.items[category];
  const newCount = day.newWords.length + day.newSentences.length + day.newPatterns.length + day.newEpisodes.length;
  return <section className="growth-record" aria-labelledby="growth-title">
    <div className="section-heading"><p className="eyebrow"><Sparkles size={18}/> MY LITTLE STEPS</p><h2 id="growth-title">我的成长记录</h2><p>每天收下一点点，会慢慢变成很大的进步。</p></div>
    <div className="growth-summary"><Surface className="stat"><strong>{summary.items.episodes.length}<small>集</small></strong><span>已学剧集</span></Surface><Surface className="stat"><strong>{summary.items.words.length}<small>个</small></strong><span>学会单词</span></Surface><Surface className="stat"><strong>{summary.items.sentences.length}<small>句</small></strong><span>学会句子</span></Surface><Surface className="stat"><strong>{summary.today.practiceCount}<small>次</small></strong><span>今天练习</span></Surface></div>
    <Surface className="growth-days"><div className="growth-days__heading"><div><p className="eyebrow"><CalendarDays size={18}/> 这一周的小脚印</p><h3>{shortDay(day.day)} 收下了 {newCount} 个新收获</h3></div></div><div className="growth-days__tabs" role="tablist" aria-label="选择学习日期">{summary.days.map(item => <button key={item.day} role="tab" aria-selected={item.day === selectedDay} aria-label={`查看 ${item.day} 的学习`} onClick={() => setSelectedDay(item.day)}><span>{shortDay(item.day)}</span><strong>{item.practiceCount || '—'}</strong></button>)}</div><p className="growth-days__detail" aria-live="polite">新单词 {day.newWords.length} 个 · 新句子 {day.newSentences.length} 句 · 新句式 {day.newPatterns.length} 个</p></Surface>
    <Surface className="growth-collection"><div className="growth-collection__heading"><div><p className="eyebrow"><BookOpen size={18}/> MY LEARNING COLLECTION</p><h3>我学会的内容</h3></div></div><div className="growth-collection__tabs" role="tablist" aria-label="学习收藏分类">{(Object.keys(labels) as Category[]).map(key => <button key={key} role="tab" aria-selected={category === key} onClick={() => setCategory(key)}>{labels[key]} <small>{summary.items[key].length}</small></button>)}</div>{items.length ? <div className="growth-items">{items.map(item => <article key={item.id}><div><strong lang="en">{item.english}</strong><span>{item.chinese}</span></div><small>学会于 {shortDay(item.firstLearnedDay)} · {familiarity(item)}</small></article>)}</div> : <div className="growth-empty"><p>这里还没有小收获，去完成今天的一小步吧。</p><Button onClick={onStartLearning}>开始今天的学习</Button></div>}</Surface>
  </section>;
}
