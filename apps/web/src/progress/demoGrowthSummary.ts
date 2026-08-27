import type { DailySummary, GrowthSummary, MasteryItem } from './localProgressRepository';

const dayKey = (date: Date, daysAgo = 0) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() - daysAgo);
  return new Date(copy.getTime() - copy.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

const item = (id: string, kind: MasteryItem['kind'], english: string, chinese: string, firstLearnedDay: string, latestPracticeDay = firstLearnedDay, correctCount = 1, totalPracticeCount = correctCount): MasteryItem => ({
  id, kind, english, chinese, episodeId: 'demo-the-park', firstLearnedDay, latestPracticeDay, correctCount, totalPracticeCount,
});

const day = (key: string, practiceCount: number, items: Partial<Pick<DailySummary, 'newWords' | 'newSentences' | 'newPatterns' | 'newEpisodes'>>): DailySummary => ({
  day: key, practiceCount, newWords: items.newWords ?? [], newSentences: items.newSentences ?? [], newPatterns: items.newPatterns ?? [], newEpisodes: items.newEpisodes ?? [],
});

export function getDemoGrowthSummary(now = new Date()): GrowthSummary {
  const today = dayKey(now);
  const yesterday = dayKey(now, 1);
  const twoDaysAgo = dayKey(now, 2);
  const threeDaysAgo = dayKey(now, 3);
  const park = item('demo-park', 'word', 'park', '公园', threeDaysAgo, today, 4, 5);
  const dinosaur = item('demo-dinosaur', 'word', 'dinosaur', '恐龙', twoDaysAgo, today, 3, 4);
  const cave = item('demo-cave', 'word', 'cave', '山洞', yesterday, today, 2, 3);
  const creature = item('demo-creature', 'word', 'creature', '生物', today, today, 0, 1);
  const rexPark = item('demo-rex-park', 'sentence', 'One day Rex was in the park.', '一天，Rex 在公园里。', threeDaysAgo, today, 3, 3);
  const batWoke = item('demo-bat-woke', 'sentence', 'Bat woke up.', '蝙蝠醒来了。', yesterday, today, 2, 2);
  const flewCave = item('demo-flew-cave', 'sentence', 'He flew out of his cave.', '他飞出了自己的山洞。', today, today, 0, 1);
  const pastTense = item('demo-past-tense', 'pattern', '动词过去式', '故事里发生过的动作变化', twoDaysAgo, today, 2, 2);
  const wasPattern = item('demo-was-pattern', 'pattern', 'was + 地点', '说“某人当时在哪里”', today);
  const episode = item('demo-episode', 'episode', 'The Park', '恐龙伙伴：公园', yesterday, today, 1, 1);
  const days = [
    day(today, 8, { newWords: [creature], newSentences: [flewCave], newPatterns: [wasPattern] }),
    day(yesterday, 5, { newWords: [cave], newSentences: [batWoke], newEpisodes: [episode] }),
    day(twoDaysAgo, 4, { newWords: [dinosaur], newPatterns: [pastTense] }),
    day(threeDaysAgo, 3, { newWords: [park], newSentences: [rexPark] }),
  ];
  return {
    today: days[0], days,
    items: { words: [park, dinosaur, cave, creature], sentences: [rexPark, batWoke, flewCave], patterns: [pastTense, wasPattern], episodes: [episode] },
    reviewItems: [creature, flewCave],
  };
}
