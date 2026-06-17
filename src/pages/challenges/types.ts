export type Tier = {
  id: number;
  name: string;
  subtier?: string | null;
  sort: number;
};

export type Objective = {
  id: number;
  name: string;
  description?: string | null;
  display_name_suffix?: string | null;
  is_arbitrary?: boolean | null;
  icon_url?: string | null;
};

export type Player = {
  id: number;
  name: string;
  account?: {
    name_color_start?: string | null;
    name_color_end?: string | null;
  } | null;
};

export type Submission = {
  id: number;
  proof_url?: string | null;
  raw_session_url?: string | null;
  player_notes?: string | null;
  verifier_notes?: string | null;
  date_created?: string | null;
  date_verified?: string | null;
  date_achieved?: string | null;
  time_taken?: number | null;
  is_verified?: boolean | null;
  is_fc?: boolean | null;
  is_obsolete?: boolean | null;
  player?: Player | null;
  verifier?: Player | null;
};

export type Challenge = {
  id: number;
  label?: string | null;
  description?: string | null;
  date_created?: string | null;
  requires_fc?: boolean | null;
  has_fc?: boolean | null;
  is_arbitrary?: boolean | null;
  sort?: number | null;
  icon_url?: string | null;
  is_rejected?: boolean | null;
  reject_note?: string | null;
  likes?: number | null;
  author_gb_name?: string | null;
  author_gb_id?: number | null;
  objective_id?: number | null;
  difficulty_id?: number | null;
  campaign_id?: number | null;
  map_id?: number | null;
  objective?: Objective | null;
  difficulty?: Tier | null;
  submissions?: Submission[] | null;
  data?: {
    submission_count?: number | null;
    is_stable?: boolean | null;
    frac?: number | null;
    sugg_count?: number | null;
  } | null;
};

export type MapRecord = {
  id: number;
  name?: string | null;
  author_gb_id?: number | null;
  author_gb_name?: string | null;
  is_archived?: boolean | null;
  icon_url?: string | null;
  campaign_id?: number | null;
};

export type CampaignRecord = {
  id: number;
  name?: string | null;
  author_gb_id?: number | null;
  author_gb_name?: string | null;
  is_archived?: boolean | null;
  icon_url?: string | null;
};

export type ListPayload = {
  tiers?: Tier[];
  campaigns?: Record<string, CampaignRecord>;
  maps?: Record<string, MapRecord>;
  challenges?: Challenge[];
};

export type NormalizedChallenge = Challenge & {
  rank: number;
  tier: Tier | null;
  mapTitle: string | null;
  campaignTitle: string | null;
  authorName: string | null;
  thumbnailUrl: string | null;
  submissions: Submission[];
  firstClearSubmission: Submission | null;
  title: string;
  submissionCount: number;
};
