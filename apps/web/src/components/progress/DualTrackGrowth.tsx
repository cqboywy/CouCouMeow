import { BookOpen, Film, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { GrowthSummary, LearningItem } from '../../progress/localProgressRepository';
import type { SchoolProgressSummary, SchoolReviewItem } from '../../progress/schoolProgressRepository';
import { Button } from '../ui/Button';
import { Surface } from '../ui/Surface';
import { GrowthRecord } from './GrowthRecord';
import { getLessonById, getUnitById } from '../../curriculum/pepGrade4UpperUnit1';

type Track = 'school' | 'extra' | 'overview';

export function DualTrackGrowth({ school, extra, onStartSchool, onStartExtra, onSchoolReview, onExtraReview }: {
  school: SchoolProgressSummary;
  extra: GrowthSummary;
  onStartSchool: () => void;
  onStartExtra: () => void;
  onSchoolReview?: (item: SchoolReviewItem) => void;
  onExtraReview?: (item: LearningItem) => void;
}) {
  const [track, setTrack] = useState<Track>('school');
  const schoolWords = school.masteredItems.filter(item => item.kind === 'word').length;
  const schoolSentences = school.masteredItems.filter(item => item.kind === 'sentence').length;
  const lessonLabel = (lessonId: string) => {
    const lesson = getLessonById(lessonId);
    const unit = lesson ? getUnitById(lesson.unitId) : undefined;
    return unit && lesson ? `Unit ${unit.sequence} · ${unit.title} · 第 ${lesson.sequence} 课` : '来自校内同步教材';
  };
  return <section className="dual-growth" aria-labelledby="dual-growth-title">
    <header className="section-heading">
      <p className="eyebrow"><Sparkles size={18} /> MY TWO LEARNING PATHS</p>
      <h2 id="dual-growth-title">我的成长记录</h2>
      <p>校内和课外分开记录，每一步都看得清楚。</p>
    </header>
    <div className="dual-growth__tabs" role="tablist" aria-label="成长记录范围">
      <button role="tab" aria-selected={track === 'school'} onClick={() => setTrack('school')}>校内成长</button>
      <button role="tab" aria-selected={track === 'extra'} onClick={() => setTrack('extra')}>课外成长</button>
      <button role="tab" aria-selected={track === 'overview'} onClick={() => setTrack('overview')}>学习总览</button>
    </div>
    {track === 'school' && <div className="school-growth">
      <div className="school-growth__stats">
        <Surface className="stat"><strong>{school.completedLessonIds.length}<small>课时</small></strong><span>已完成课时</span></Surface>
        <Surface className="stat"><strong>{schoolWords}<small>个</small></strong><span>教材单词</span></Surface>
        <Surface className="stat"><strong>{schoolSentences}<small>句</small></strong><span>核心句子</span></Surface>
        <Surface className="stat"><strong>{school.reviewItems.length}<small>项</small></strong><span>校内待复习</span></Surface>
      </div>
      {school.reviewItems.length > 0 && <Surface className="school-growth__review"><h3>校内需要再抱抱的小难题</h3>{school.reviewItems.map(item => <button key={item.id} type="button" onClick={() => onSchoolReview?.(item)}><strong lang="en">{item.english}</strong><span>{item.chinese}</span></button>)}</Surface>}
      <Surface className="school-growth__collection"><p className="eyebrow"><BookOpen size={18} /> PEP 四年级上册</p><h3>校内学会的内容</h3>{school.masteredItems.length ? <div>{school.masteredItems.map(item => <article key={item.id}><strong lang="en">{item.english}</strong><span>{item.chinese}</span><small>{lessonLabel(item.lessonId)}</small></article>)}</div> : <div className="growth-empty"><p>还没有完成的校内课时。</p><Button onClick={onStartSchool}>开始校内学习</Button></div>}</Surface>
    </div>}
    {track === 'extra' && <GrowthRecord summary={extra} onStartLearning={onStartExtra} onReviewItem={onExtraReview} />}
    {track === 'overview' && <div className="dual-growth__overview">
      <section className="surface" aria-label="校内学习摘要"><BookOpen size={26} /><h3>校内同步</h3><strong>{school.completedLessonIds.length} 课时</strong><span>{schoolWords} 个教材单词 · {school.practiceCount} 次练习</span><Button variant="secondary" onClick={() => setTrack('school')}>查看校内成长</Button></section>
      <section className="surface" aria-label="课外学习摘要"><Film size={26} /><h3>课外动画</h3><strong>{extra.items.episodes.length} 集动画</strong><span>{extra.items.words.length} 个动画单词 · {extra.today.practiceCount} 次今日练习</span><Button variant="secondary" onClick={() => setTrack('extra')}>查看课外成长</Button></section>
    </div>}
  </section>;
}
