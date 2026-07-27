import { api } from "@/shared/lib/api";
import type { Topic } from "@/shared/types/topic";

export async function fetchTopics(): Promise<Topic[]> {
  const { data } = await api.get<Topic[]>("/topics");
  return data;
}
