import type { Category } from '../types/Category';
import type { Locale } from './locale';

type HomeCopy = {
  browse: string;
  categoryNavLabel: string;
  feedbackPrefix: string;
  feedbackSuffix: string;
  categories: Record<Category, string>;
  linksLabel: (count: number) => string;
};

export const homeCopy: Record<Locale, HomeCopy> = {
  en: {
    browse: 'Browse',
    categoryNavLabel: 'Resource categories',
    feedbackPrefix: 'Feedback or change requests? DM',
    feedbackSuffix: ' on Discord',
    categories: {
      official: 'Official',
      general: 'General',
      'discord-global': 'Discord',
      modding: 'Modding',
      challenge: 'Challenges',
      speedrunning: 'Speedrunning',
      merch: 'Merch',
      misc: 'Misc.',
    },
    linksLabel: (count) => `${count} links`,
  },
  ko: {
    browse: '둘러보기',
    categoryNavLabel: '자료 카테고리',
    feedbackPrefix: '피드백이나 수정 요청은 디스코드',
    feedbackSuffix: '에게 DM 주세요',
    categories: {
      official: '공식',
      general: '일반',
      'discord-global': '디스코드',
      modding: '모딩',
      challenge: '챌린지',
      speedrunning: '스피드런',
      merch: '굿즈',
      misc: '기타',
    },
    linksLabel: (count) => `링크 ${count}개`,
  },
};
