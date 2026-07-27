import type { Quote } from "@/shared/types/quote";

export interface Collection {
  id: string;
  name: string;
  quoteCount: number;
}

export interface CollectionDetail {
  id: string;
  name: string;
  quotes: Quote[];
}
