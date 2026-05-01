export const CATEGORY = {
  OFFICIAL: 'official',
  GENERAL: 'general',
  DISCORD_GLOBAL: 'discord-global',
  MODDING: 'modding',
  CHALLENGE: 'challenge',
  SPEEDRUNNING: 'speedrunning',
  MERCH: 'merch',
  MISC: 'misc',
} as const;

export type Category = (typeof CATEGORY)[keyof typeof CATEGORY];
