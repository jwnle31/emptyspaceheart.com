import type { Category } from '../types/Category';
import type { Locale } from './locale';

type HomeCopy = {
  browse: string;
  categoryNavLabel: string;
  categories: Record<Category, string>;
  linksLabel: (count: number) => string;
};

export const homeCopy: Record<Locale, HomeCopy> = {
  en: {
    browse: 'Browse',
    categoryNavLabel: 'Resource categories',
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
