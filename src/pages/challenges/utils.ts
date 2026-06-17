import { formatNumber, getTierColor } from '../deathless/utils';
import type {
  Challenge,
  CampaignRecord,
  MapRecord,
  NormalizedChallenge,
  Submission,
  Tier,
} from './types';

export const LIST_URL =
  'https://goldberries.net/api/lists/top-golden-list?archived=true&min_diff_sort=12&max_diff_sort=22&sub_count_is_min=false&clear_state=0';
export const TOP_LIMIT = 200;

export function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  return [];
}

export function formatDate(value: string | null | undefined, withTime = false) {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: withTime ? 'short' : undefined,
  }).format(date);
}

export function formatDuration(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 'Unknown';
  }

  const totalSeconds = Math.max(0, Math.round(value));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

export function getFirstClearSubmission(submissions: Submission[]) {
  return (
    submissions
      .slice()
      .sort((left, right) => {
        const leftTime = new Date(
          left.date_verified ?? left.date_achieved ?? left.date_created ?? 0,
        ).getTime();
        const rightTime = new Date(
          right.date_verified ?? right.date_achieved ?? right.date_created ?? 0,
        ).getTime();

        return leftTime - rightTime;
      })[0] ?? null
  );
}

export function resolveGoldberriesUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `https://goldberries.net${url}`;
}

export function getProofEmbedUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v');

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (parsed.hostname === 'youtu.be') {
      const videoId = parsed.pathname.replace(/^\/+/, '');

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (parsed.hostname.includes('drive.google.com')) {
      const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
      const fileId = fileMatch?.[1] ?? parsed.searchParams.get('id');

      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }

    return url;
  } catch {
    return url;
  }
}

export function cleanGbAuthorName(value: string | null | undefined) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function getChallengeFracValue(value: unknown) {
  if (typeof value === 'boolean') {
    return value ? 1 : 0.5;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  return 0;
}

export function getChallengeThumbnailUrl(
  challenge: Challenge,
  mapRecord: MapRecord | null,
  campaignRecord: CampaignRecord | null,
) {
  if (challenge.map_id != null) {
    return `https://goldberries.net/img/map/${challenge.map_id}&scale=1`;
  }

  if (challenge.campaign_id != null) {
    return `https://goldberries.net/embed/img/campaign_collage.php?id=${challenge.campaign_id}&scale=1`;
  }

  if (challenge.icon_url) {
    return resolveGoldberriesUrl(challenge.icon_url);
  }

  if (campaignRecord?.icon_url) {
    return resolveGoldberriesUrl(campaignRecord.icon_url);
  }

  if (mapRecord?.icon_url) {
    return resolveGoldberriesUrl(mapRecord.icon_url);
  }

  return null;
}

export function getChallengeTitle(
  challenge: Challenge,
  mapTitle: string | null,
  mapArchived: boolean,
  campaignTitle: string | null,
  campaignArchived: boolean,
) {
  if (mapTitle && mapTitle.trim()) {
    return `${mapArchived ? '[Old] ' : ''}${mapTitle}`;
  }

  if (campaignTitle && campaignTitle.trim()) {
    return `${campaignArchived ? '[Old] ' : ''}${campaignTitle}`;
  }

  return `Challenge ${challenge.id}`;
}

export function formatObjectiveTierDisplay(tier: Tier | null) {
  if (!tier) {
    return 'Unknown';
  }

  return `T${Math.trunc(tier.sort)}`;
}

export function formatFractionalTierDisplay(
  tier: Tier | null,
  fraction?: number | null,
) {
  if (!tier) {
    return 'Unknown';
  }

  const fractionValue = getChallengeFracValue(fraction);
  const total = tier.sort + fractionValue;

  return `~T${total.toFixed(2)}`;
}

export function getStatusChips(challenge: NormalizedChallenge) {
  const chips: string[] = [];

  if (challenge.requires_fc) {
    chips.push('FC');
  }

  if (challenge.is_arbitrary) {
    chips.push('Arbitrary');
  }

  if (challenge.is_rejected) {
    chips.push('Rejected');
  }

  return chips;
}

export { formatNumber, getTierColor };
