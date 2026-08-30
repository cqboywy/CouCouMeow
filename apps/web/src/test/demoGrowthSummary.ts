import type { DailySummary, GrowthSummary, MasteryItem } from '../progress/extraProgressSummary';

const dayKey = (date: Date, daysAgo = 0) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() - daysAgo);
  return new Date(copy.getTime() - copy.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

const item = (id: string, kind: MasteryItem['kind'], english: string, chinese: string, episodeId: string, firstLearnedDay: string, latestPracticeDay = firstLearnedDay, correctCount = 1, totalPracticeCount = correctCount): MasteryItem => ({
  id, kind, english, chinese, episodeId, firstLearnedDay, latestPracticeDay, correctCount, totalPracticeCount,
});

const day = (key: string, practiceCount: number, items: Partial<Pick<DailySummary, 'newWords' | 'newSentences' | 'newPatterns' | 'newEpisodes'>>): DailySummary => ({
  day: key, practiceCount, newWords: items.newWords ?? [], newSentences: items.newSentences ?? [], newPatterns: items.newPatterns ?? [], newEpisodes: items.newEpisodes ?? [],
});

export function getDemoGrowthSummary(now = new Date()): GrowthSummary {
  const today = dayKey(now);
  const yesterday = dayKey(now, 1);
  const twoDaysAgo = dayKey(now, 2);
  const threeDaysAgo = dayKey(now, 3);
  const dinoEpisode = 'l1-001-dino-buddies-the-park';
  const batEpisode = 'l1-bat-and-friends-001-hunting-for-bugs';
  const park = item('vocab-park', 'word', 'park', '公园', dinoEpisode, threeDaysAgo, today, 4, 5);
  const dinosaur = item('vocab-dinosaur', 'word', 'dinosaur', '恐龙', dinoEpisode, twoDaysAgo, today, 3, 4);
  const cave = item('bat-1-vocab-cave', 'word', 'cave', '山洞', batEpisode, yesterday, today, 2, 3);
  const friend = item('vocab-friend', 'word', 'friend', '朋友', dinoEpisode, today, today, 0, 1);
  const rexPark = item('sentence-1', 'sentence', 'One day Rex was in the park.', '一天，Rex 在公园里。', dinoEpisode, threeDaysAgo, today, 3, 3);
  const batWoke = item('bat-1-sentence-1', 'sentence', 'Bat woke up.', '蝙蝠醒来了。', batEpisode, yesterday, today, 2, 2);
  const flewCave = item('bat-1-sentence-2', 'sentence', 'He flew out of his cave.', '他飞出了自己的山洞。', batEpisode, today, today, 0, 1);
  const pastTense = item('knowledge-1', 'pattern', '动词过去式', '故事里发生过的动作变化', dinoEpisode, twoDaysAgo, today, 2, 2);
  const wasPattern = item('knowledge-1', 'pattern', 'was + 地点', '说“某人当时在哪里”', dinoEpisode, today);
  const episode = item(dinoEpisode, 'episode', 'The Park', '恐龙伙伴：公园', dinoEpisode, yesterday, today, 1, 1);
  const days = [
    day(today, 8, { newWords: [friend], newSentences: [flewCave], newPatterns: [wasPattern] }),
    day(yesterday, 5, { newWords: [cave], newSentences: [batWoke], newEpisodes: [episode] }),
    day(twoDaysAgo, 4, { newWords: [dinosaur], newPatterns: [pastTense] }),
    day(threeDaysAgo, 3, { newWords: [park], newSentences: [rexPark] }),
  ];
  return {
    today: days[0], days,
    items: { words: [park, dinosaur, cave, friend], sentences: [rexPark, batWoke, flewCave], patterns: [pastTense, wasPattern], episodes: [episode] },
    reviewItems: [friend, flewCave],
  };
}
