import { useEffect, useMemo, useState } from 'react';
import {
  getChallengeThumbnailUrl,
  getChallengeTitle,
  getFirstClearSubmission,
  cleanGbAuthorName,
  getChallengeFracValue,
  toArray,
  LIST_URL,
  TOP_LIMIT,
} from './utils';
import type {
  Challenge,
  ListPayload,
  NormalizedChallenge,
  Submission,
  Tier,
} from './types';

export function useChallengesViewModel() {
  const [payload, setPayload] = useState<ListPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isNarrowScreen, setIsNarrowScreen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadData() {
      try {
        const response = await fetch(LIST_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = (await response.json()) as ListPayload;

        if (!active) {
          return;
        }

        setPayload(data);
        setError(null);
      } catch (caughtError) {
        if (!active || controller.signal.aborted) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load the Goldberries challenge list.',
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 48rem)');

    const updateMatch = () => {
      setIsNarrowScreen(mediaQuery.matches);
    };

    updateMatch();
    mediaQuery.addEventListener('change', updateMatch);

    return () => {
      mediaQuery.removeEventListener('change', updateMatch);
    };
  }, []);

  const topChallenges = useMemo(() => {
    const tiers = new Map<number, Tier>();

    payload?.tiers?.forEach((tier) => {
      tiers.set(tier.id, tier);
    });

    const maps = payload?.maps ?? {};
    const campaigns = payload?.campaigns ?? {};

    const rankedChallenges = toArray<Challenge>(payload?.challenges)
      .map((challenge) => {
        const tier =
          challenge.difficulty ?? tiers.get(challenge.difficulty_id ?? -1) ?? null;
        const mapRecord =
          challenge.map_id != null ? maps[String(challenge.map_id)] ?? null : null;
        const mapCampaignRecord =
          mapRecord?.campaign_id != null
            ? campaigns[String(mapRecord.campaign_id)] ?? null
            : null;
        const campaignRecord =
          challenge.campaign_id != null
            ? campaigns[String(challenge.campaign_id)] ?? null
            : null;
        const mapTitle = mapRecord?.name ?? null;
        const mapArchived = mapRecord?.is_archived ?? false;
        const campaignTitle = campaignRecord?.name ?? null;
        const campaignArchived = campaignRecord?.is_archived ?? false;
        const authorName =
          cleanGbAuthorName(mapRecord?.author_gb_name) ??
          cleanGbAuthorName(mapCampaignRecord?.author_gb_name) ??
          cleanGbAuthorName(campaignRecord?.author_gb_name) ??
          cleanGbAuthorName(challenge.author_gb_name);
        const thumbnailUrl = getChallengeThumbnailUrl(challenge, mapRecord, campaignRecord);

        return {
          challenge,
          tier,
          mapTitle,
          mapArchived,
          campaignTitle,
          campaignArchived,
          authorName,
          thumbnailUrl,
        };
      })
      .filter(
        ({ tier }) =>
          !!tier &&
          typeof tier.sort === 'number' &&
          Number.isFinite(tier.sort) &&
          tier.sort >= -1,
      )
      .sort((left, right) => {
        const tierDelta = (right.tier?.sort ?? -1) - (left.tier?.sort ?? -1);

        if (tierDelta !== 0) {
          return tierDelta;
        }

        const leftFraction =
          getChallengeFracValue(left.challenge.data?.frac);
        const rightFraction =
          getChallengeFracValue(right.challenge.data?.frac);

        return rightFraction - leftFraction;
      })
      .map((entry) => ({
        ...entry,
        challenge: {
          ...entry.challenge,
          data: entry.challenge.data
            ? {
                ...entry.challenge.data,
                frac: getChallengeFracValue(entry.challenge.data.frac),
              }
            : entry.challenge.data,
        },
      }))
      .slice(0, TOP_LIMIT);

    return rankedChallenges.map<NormalizedChallenge>(
      (
        {
          challenge,
          tier,
          mapTitle,
          mapArchived,
          campaignTitle,
          campaignArchived,
          authorName,
          thumbnailUrl,
        },
        index,
      ) => {
        const submissions = toArray<Submission>(challenge.submissions);
        const firstClearSubmission = getFirstClearSubmission(submissions);
        const title = getChallengeTitle(
          challenge,
          mapTitle,
          mapArchived,
          campaignTitle,
          campaignArchived,
        );

        return {
          ...challenge,
          rank: index + 1,
          tier,
          mapTitle,
          mapArchived,
          campaignTitle,
          campaignArchived,
          authorName,
          thumbnailUrl,
          submissions,
          firstClearSubmission,
          title,
          submissionCount: challenge.data?.submission_count ?? submissions.length,
        };
      },
    );
  }, [payload]);

  const tiersBySort = useMemo(() => {
    const tiers = new Map<number, Tier>();

    payload?.tiers?.forEach((tier) => {
      tiers.set(tier.sort, tier);
    });

    return tiers;
  }, [payload]);

  return {
    loading,
    error,
    expandedId,
    setExpandedId,
    isNarrowScreen,
    topChallenges,
    tiersBySort,
  };
}
