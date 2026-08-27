export type ExtraRecommendation = {
  episodeId: string;
  label: string;
  reason: string;
};

const recommendations: Record<string, ExtraRecommendation> = {
  'pep4a-u1': { episodeId: 'l1-001-dino-buddies-the-park', label: 'The Park', reason: '学完家庭与帮助的课本内容后，用动画轻松复习 friend、help 和 can。' },
  'pep4a-u2': { episodeId: 'l1-bat-and-friends-002-lost-in-the-rain', label: 'Lost in the Rain', reason: '学完朋友主题后，用动画轻松复习 friend、kind 和 help。' },
};

export const getExtraRecommendation = (unitId: string) => recommendations[unitId];
