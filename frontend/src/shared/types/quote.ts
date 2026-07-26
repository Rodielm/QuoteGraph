export interface AuthorSummary {
  name: string;
  slug: string;
}

export interface Quote {
  id: string;
  text: string;
  author: AuthorSummary;
  tags: string[];
}

export interface QuoteListResponse {
  items: Quote[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}
