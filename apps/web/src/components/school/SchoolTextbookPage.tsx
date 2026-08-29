import { ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { TextbookFocusItem, TextbookPage, TextbookPageCheck } from '../../curriculum/types';
import { useEnglishSpeech } from '../../hooks/useEnglishSpeech';
import { Button } from '../ui/Button';
import { Surface } from '../ui/Surface';

type Props = {
  page: TextbookPage;
  onRecordCheck: (page: TextbookPage, check: TextbookPageCheck, correct: boolean) => void;
  onComplete: (page: TextbookPage) => void;
  onLaterReview: (page: TextbookPage, item: TextbookFocusItem) => void;
  onBack: () => void;
  onOpenNext?: () => void;
};

const normalize = (value: string) => value.trim().toLocaleLowerCase().replace(/[.!?'’]/g, '');

export function SchoolTextbookPage({ page, onRecordCheck, onComplete, onLaterReview, onBack, onOpenNext }: Props) {
  const speech = useEnglishSpeech();
  const pageEnglish = useMemo(() => page.sections.flatMap(section => section.sentences.map(sentence => sentence.english)), [page]);
  const [showChinese, setShowChinese] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [challengeFinished, setChallengeFinished] = useState(false);
  const [answerVisible, setAnswerVisible] = useState(false);
  const [checkIndex, setCheckIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [checksDone, setChecksDone] = useState<string[]>([]);
  const prompt = page.practicePrompts[practiceIndex];
  const check = page.checks[checkIndex];
  const focus = page.focusItems.find(item => item.id === focusId);
  const practiceItem: TextbookFocusItem = {
    id: prompt.id,
    kind: 'sentence',
    english: prompt.answer,
    chinese: prompt.chinesePrompt,
    source: 'body',
    note: '本页开口挑战',
  };
  const toggleChinese = () => setShowChinese(value => !value);
  const showFocus = (id: string) => setFocusId(current => current === id ? null : id);
  useEffect(() => { speech.preload(pageEnglish); }, [pageEnglish, speech.preload]);
  const submitCheck = () => {
    const correct = normalize(answer) === normalize(check.answer);
    onRecordCheck(page, check, correct);
    if (!correct) { setFeedback(`再想一想：${check.hint}`); return; }
    setFeedback('答对了，真棒！');
    const completed = [...new Set([...checksDone, check.id])];
    setChecksDone(completed);
    if (checkIndex < page.checks.length - 1) {
      window.setTimeout(() => { setCheckIndex(index => index + 1); setAnswer(''); setFeedback(''); }, 450);
    }
  };
  const allChecksDone = checksDone.length === page.checks.length;
  const pageFinish = page.finishItems ?? (page.printedPage === 4
    ? ['问一问家人的职业。', '回答 She’s a doctor. / He’s a PE teacher.', '认识 family、job、doctor 和 teacher。']
    : ['用 Can ... help? 问一问谁能帮忙。', '说出 I can clean my room.', '认识 clean、room、chore 和 sweep the floor。']);
  const advanceChallenge = () => {
    if (practiceIndex >= page.practicePrompts.length - 1) { setChallengeFinished(true); return; }
    setPracticeIndex(index => index + 1);
    setAnswerVisible(false);
  };

  return <main className="school-page textbook-page" aria-labelledby="textbook-page-title">
    <button className="back-link" type="button" onClick={onBack}><ChevronLeft size={20} /> 回到 Unit 1</button>
    <header className="textbook-page__header">
      <p className="eyebrow">PEP 四年级上册 · Unit 1 · 课本第 {page.printedPage} 页</p>
      <h2 id="textbook-page-title">{page.chineseTitle}</h2>
      <p lang="en">{page.title}</p>
    </header>
    <section className="textbook-page__toolbar" aria-label="中文提示设置"><div><strong>中文提示</strong><span>帮助理解；隐藏后试着自己说意思。</span></div><button type="button" aria-pressed={showChinese} onClick={toggleChinese}>{showChinese ? '隐藏中文' : '显示中文'}</button></section>
    <section className="textbook-focus-map" aria-labelledby="page-focus-title"><div><h3 id="page-focus-title">本页重点</h3><small>点击词块，在原句下方看提示</small></div><div>{page.focusItems.map(item => <button type="button" key={item.id} aria-pressed={focusId === item.id} onClick={() => showFocus(item.id)}>{item.english}</button>)}</div></section>
    <p className="textbook-page__hint">先读英文；遇到不懂的地方，再打开中文提示。</p>
    {page.sections.map((section, index) => <Surface className="textbook-section" data-testid={`page-${page.printedPage}-section-${section.id}`} key={section.id}>
      <header><span>{String(index + 1).padStart(2, '0')}</span><div><h3 lang="en">{section.label}</h3>{showChinese && <p>{section.chineseLabel}</p>}</div></header>
      <div className="textbook-section__sentences">{section.sentences.map(sentence => <article key={sentence.id}>
        <div className="textbook-line"><strong lang="en">{sentence.english}</strong><button type="button" aria-label={`朗读 ${sentence.english}`} onClick={() => speech.speak(sentence.english, sentence.id)}><Volume2 size={20} /></button></div>
        {showChinese && <p className="textbook-line__translation">{sentence.chinese}</p>}
        {sentence.focusItemIds?.length ? <div className="textbook-line__focuses">{sentence.focusItemIds.map(id => {
          const item = page.focusItems.find(candidate => candidate.id === id)!;
          return <button type="button" aria-label={`查看 ${item.english} 提示`} aria-pressed={focusId === id} key={id} onClick={() => showFocus(id)}>{item.english}</button>;
        })}</div> : null}
        {focus && sentence.focusItemIds?.includes(focus.id) && <aside className="textbook-focus-tip" role="status"><div><strong lang="en">{focus.english}</strong><span> · {focus.chinese} · {focus.note}</span></div><button type="button" aria-label={`朗读 ${focus.english}`} onClick={() => speech.speak(focus.english, focus.id)}><Volume2 size={18} /></button></aside>}
      </article>)}</div>
    </Surface>)}
    {!challengeStarted ? <Surface className="textbook-practice textbook-practice--entry"><p>读完了，试着不用看英文说出来。</p><small>会随机抽查课本原句，也会练习相似句型。</small><Button onClick={() => setChallengeStarted(true)}>开始开口挑战</Button></Surface> : <Surface className="textbook-practice"><p className="school-kicker">开口挑战 · 看中文，说英文 · {challengeFinished ? '完成这一轮' : `第 ${practiceIndex + 1}/${page.practicePrompts.length} 题`}</p>{challengeFinished ? <><h3>你完成了！</h3><p className="textbook-practice__answer">明天再回来，句子会越来越熟。</p></> : <><h3>{prompt.chinesePrompt}</h3>{answerVisible && <div className="textbook-practice__answer"><strong lang="en">{prompt.answer}</strong><button type="button" aria-label={`朗读 ${prompt.answer}`} onClick={() => speech.speak(prompt.answer, prompt.id)}><Volume2 size={20} /></button></div>}<div><Button variant="secondary" onClick={() => setAnswerVisible(true)}>{answerVisible ? '再看一次答案' : '我说好了，看看答案'}</Button>{answerVisible && <><Button variant="secondary" onClick={() => { onLaterReview(page, practiceItem); advanceChallenge(); }}>还不熟，稍后再学</Button><Button onClick={advanceChallenge}>我会了 {practiceIndex < page.practicePrompts.length - 1 ? '，下一句' : '，完成挑战'} <ChevronRight size={18} /></Button></>}</div></>}</Surface>}
    <Surface className="textbook-finish"><p className="school-kicker">PAGE {page.printedPage} · 今日收尾</p><h3>这一页，我能做到</h3><ul>{pageFinish.map(item => <li key={item}>{item}</li>)}</ul><p>{challengeFinished ? '开口挑战完成了；再通过小检查，就可以把本页收好。' : '完成开口挑战后，再通过小检查，就可以把本页收好。'}</p></Surface>
    <Surface className="textbook-check"><p className="school-kicker">本页小检查 · 第 {Math.min(checkIndex + 1, page.checks.length)} / {page.checks.length} 题</p>{!allChecksDone ? <><h3>{check.prompt}</h3><label>填写答案<input aria-label="填写本页答案" value={answer} onChange={event => { setAnswer(event.target.value); setFeedback(''); }} autoComplete="off" /></label><Button disabled={!answer} onClick={submitCheck}>检查答案</Button>{feedback && <p role="status" className="answer-note">{feedback}</p>}</> : <><h3>这一页的小检查完成啦！</h3><Button onClick={() => onComplete(page)}>完成本页</Button>{onOpenNext && <Button variant="secondary" onClick={onOpenNext}>去下一页</Button>}</>}</Surface>
    {speech.message && <p className={`school-speech school-speech--${speech.phase}`} role="status">{speech.message}</p>}
    <button className="textbook-translation-toggle" type="button" aria-pressed={showChinese} onClick={toggleChinese}>{showChinese ? '隐藏中文' : '显示中文'}</button>
  </main>;
}
