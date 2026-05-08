export type NewsCategory = 'top' | 'movie' | 'tv' | 'celebrity';

export interface GuardianFields {
  thumbnail?: string;
  trailText?: string;
  byline?: string;
}

export interface GuardianResult {
  id: string;
  webTitle: string;
  webPublicationDate: string;
  webUrl: string;
  sectionName: string;
  fields?: GuardianFields;
}

export interface GuardianApiResponse {
  response: {
    status: string;
    total: number;
    results: GuardianResult[];
  };
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  publishedAt: Date;
  sourceLabel: string;
  articleUrl: string;
}
