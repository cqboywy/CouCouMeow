import { BookOpen, CheckCircle2, ChevronLeft, Volume2 } from 'lucide-react';
import { useState } from 'react';
import type { SchoolExercise, SchoolLearningItem, SchoolLesson as CurriculumLesson, SchoolUnit } from '../../content/types';
import { useEnglishSpeech } from '../../hooks/useEnglishSpeech';
import { Button } from '../ui/Button';
import { Surface } from '../ui/Surface';

type Props = {
  lesson: CurriculumLesson;
  unit?: SchoolUnit;
  initialStep?: 'learn' | 'practice' | 'check';
  onRecordExercise: (lesson: CurriculumLesson, exercise: SchoolExercise, correct: boolean) => void;
  onComplete: (lesson: CurriculumLesson) => void;
  onBack: () => void;
  storageError: string;
};

const normalize = (value: string) => value.trim().toLocaleLowerCase().replace(/[.!?]/g, '');

function LearningItems({ title, items }: { title: string; items: SchoolLearningItem[] }) {
  const speech = useEnglishSpeech();
  if (!items.length) return null;
  return <section className="school-items" aria-label={title}>
    <h3>{title}</h3>
    <div>{items.map(item => <article key={item.id}>
      <button type="button" aria-label={`朗读 ${item.english}`} onClick={() => speech.speak(item.english, item.id)}><Volume2 size={20} /></button>
      <span><strong lang="en">{item.english}</strong><small>{item.chinese}</small></span>
      {item.phonetic && <em>{item.phonetic}</em>}
    </article>)}</div>
    {speech.message && <p className={`school-speech school-speech--${speech.phase}`} role="status">{speech.message}</p>}
  </section>;
}

export function SchoolLesson({ lesson, unit, initialStep = 'learn', onRecordExercise, onComplete, onBack, storageError }: Props) {
  const unitSequence = unit?.sequence ?? Number(lesson.unitId.match(/-u(\d+)$/)?.[1] ?? 1);
  const [step, setStep] = useState<0 | 1 | 2>(initialStep === 'practice' ? 1 : initialStep === 'check' ? 2 : 0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [correct, setCorrect] = useState(false);
  const stage = step === 2 ? 'check' : 'practice';
  const exercises = lesson.exercises.filter(item => item.stage === stage);
  const exercise = exercises[questionIndex] ?? exercises[0];
  const moveTo = (next: 0 | 1 | 2) => { setStep(next); setQuestionIndex(0); setAnswer(''); setFeedback(''); setCorrect(false); };
  const moveToNextQuestion = () => { setQuestionIndex(index => index + 1); setAnswer(''); setFeedback(''); setCorrect(false); };
  const isFinalQuestion = questionIndex === exercises.length - 1;
  const check = () => {
    const isCorrect = normalize(answer) === normalize(exercise.answer);
    onRecordExercise(lesson, exercise, isCorrect);
    setCorrect(isCorrect);
    setFeedback(isCorrect ? '答对啦，轻轻松松完成这一小步！' : `还差一点点。提示：${exercise.hint}`);
  };
  const finish = () => { onComplete(lesson); };
  return <main className="school-page school-lesson" aria-labelledby="school-lesson-title">
    <button className="back-link" type="button" onClick={onBack}><ChevronLeft size={20} /> 回到 Unit {unitSequence}</button>
    <header className="school-lesson__header">
      <p className="eyebrow">PEP 四年级上册 · Unit {unitSequence} · 第 {lesson.sequence} 课</p>
      <h2 id="school-lesson-title">{lesson.title}</h2>
      <p>{lesson.subtitle}</p>
      <span><BookOpen size={18} /> 请打开课本第 {lesson.pageReferences.join('–')} 页 · 约 {lesson.durationMinutes} 分钟</span>
    </header>
    <nav className="school-stepper" aria-label="本课学习步骤">
      {lesson.steps.map((item, index) => <button key={item.kind} type="button" aria-current={step === index ? 'step' : undefined} onClick={() => moveTo(index as 0 | 1 | 2)}>
        <b>{index + 1}</b>{item.title}
      </button>)}
    </nav>
    {step === 0 ? <Surface className="school-lesson__content">
      <p className="school-kicker">先认识，再开口</p>
      <h3>{lesson.explanation}</h3>
      <LearningItems title="本课单词" items={lesson.vocabulary} />
      <LearningItems title="本课句子" items={lesson.sentences} />
      <LearningItems title="拼读发现" items={lesson.phonics} />
      <Button onClick={() => moveTo(1)}>开始练习</Button>
    </Surface> : <Surface className="school-exercise">
      <p className="school-kicker">{step === 1 ? '练一练' : '小检查'}</p>
      <p className="school-exercise__count">第 {questionIndex + 1} / {exercises.length} 题</p>
      <h3>{exercise.prompt}</h3>
      {exercise.kind === 'choice' ? <div className="school-exercise__choices">
        {exercise.options?.map(option => <button type="button" className={answer === option ? 'selected' : ''} key={option} onClick={() => { setAnswer(option); setFeedback(''); }}>{option}</button>)}
      </div> : exercise.kind === 'self_check' ? <button type="button" className={`school-self-check ${answer === 'yes' ? 'selected' : ''}`} onClick={() => setAnswer('yes')}><CheckCircle2 size={22} /> 我会了</button> : <label className="school-exercise__input">填写答案<input aria-label="填写答案" value={answer} onChange={event => { setAnswer(event.target.value); setFeedback(''); }} autoComplete="off" /></label>}
      {!feedback && <Button disabled={!answer} onClick={check}>检查答案</Button>}
      {feedback && <p className={correct ? 'answer-note answer-note--correct' : 'answer-note'} role="status">{feedback}</p>}
      {correct && !isFinalQuestion && <Button onClick={moveToNextQuestion}>下一题</Button>}
      {correct && isFinalQuestion && step === 1 && <Button onClick={() => moveTo(2)}>去做小检查</Button>}
      {correct && isFinalQuestion && step === 2 && <Button onClick={finish}>完成本课</Button>}
      {storageError && <p className="gentle-note" role="status">{storageError}</p>}
    </Surface>}
  </main>;
}
