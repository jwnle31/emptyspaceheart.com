import type { Locale } from './locale';

export const SITE_DESCRIPTION = 'A minimalist hub for Celeste.';

type CommonCopy = {
  home: string;
  speedrunning: string;
  deathless: string;
  topChallenges: string;
  about: string;
  siteData: string;
  footerNavigationLabel: string;
};

export const commonCopy: Record<Locale, CommonCopy> = {
  en: {
    home: 'Home',
    speedrunning: 'Speedrunning',
    deathless: 'Deathless',
    topChallenges: 'Top challenges',
    about: 'About',
    siteData: 'Site data',
    footerNavigationLabel: 'Footer navigation',
  },
  ko: {
    home: '홈',
    speedrunning: '스피드런',
    deathless: '데스리스',
    topChallenges: '상위 챌린지',
    about: '소개',
    siteData: '사이트 통계',
    footerNavigationLabel: '하단 메뉴',
  },
};
