import type { Quote } from "@/shared/types/quote";

export interface Reflection {
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReflectedQuote {
  quote: Quote;
  reflection: Reflection;
}
