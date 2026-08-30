import { BookOpen, Film, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { GrowthSummary, LearningItem } from '../../progress/localProgressRepository';
import type { SchoolProgressSummary, SchoolReviewItem } from '../../progress/schoolProgressRepository';
import { Button } from '../ui/Button';
import { Surface } from '../ui/Surface';
import { GrowthRecord } from './GrowthRecord';
import { SchoolGrowthRecord } from './SchoolGrowthRecord';

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
    {track === 'school' && <><SchoolGrowthRecord summary={school} onStartLearning={onStartSchool} />{school.reviewItems.length > 0 && <Surface className="school-growth__review"><h3>校内需要再抱抱的小难题</h3>{school.reviewItems.map(item => <button key={item.id} type="button" onClick={() => onSchoolReview?.(item)}><strong lang="en">{item.english}</strong><span>{item.chinese}</span></button>)}</Surface>}</>}
    {track === 'extra' && <GrowthRecord summary={extra} onStartLearning={onStartExtra} onReviewItem={onExtraReview} />}
    {track === 'overview' && <div className="dual-growth__overview">
      <section className="surface" aria-label="校内学习摘要"><BookOpen size={26} /><h3>校内同步</h3><strong>{school.completedLessonIds.length} 课时</strong><span>{schoolWords} 个教材单词 · {school.practiceCount} 次练习</span><Button variant="secondary" onClick={() => setTrack('school')}>查看校内成长</Button></section>
      <section className="surface" aria-label="课外学习摘要"><Film size={26} /><h3>课外动画</h3><strong>{extra.items.episodes.length} 集动画</strong><span>{extra.items.words.length} 个动画单词 · {extra.today.practiceCount} 次今日练习</span><Button variant="secondary" onClick={() => setTrack('extra')}>查看课外成长</Button></section>
    </div>}
  </section>;
}
