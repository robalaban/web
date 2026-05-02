import type { ProjectEntry } from "./github";

export interface KaggleNotebook {
  name: string;
  url: string;
  description: string;
  updatedAt: string;
}

export interface KaggleDataset {
  name: string;
  url: string;
  description: string;
  updatedAt: string;
}

function kaggleAuth(): string | null {
  const token = import.meta.env.KAGGLE_TOKEN;
  if (!token) return null;
  return `Bearer ${token}`;
}

export async function fetchKaggleNotebooks(
  entries: ProjectEntry[],
): Promise<KaggleNotebook[]> {
  if (entries.length === 0) return [];
  const auth = kaggleAuth();
  if (!auth) {
    console.warn("KAGGLE_TOKEN not set, skipping notebooks");
    return [];
  }

  const username = entries[0].slug.split("/")[0];
  const descMap = new Map(entries.map((e) => [e.slug, e.description]));

  try {
    const res = await fetch(
      `https://www.kaggle.com/api/v1/kernels/list?user=${username}&pageSize=50&sortBy=dateRun`,
      { headers: { Authorization: auth } },
    );

    if (!res.ok) {
      console.warn(`Kaggle notebooks fetch failed: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return data
      .filter((item: any) => descMap.has(item.ref))
      .map((item: any) => ({
        name: item.title,
        url: `https://www.kaggle.com/code/${item.ref}`,
        description: descMap.get(item.ref) || "",
        updatedAt: item.lastRunTime,
      }));
  } catch (err) {
    console.warn("Error fetching Kaggle notebooks:", err);
    return [];
  }
}

export async function fetchKaggleDatasets(
  entries: ProjectEntry[],
): Promise<KaggleDataset[]> {
  if (entries.length === 0) return [];
  const auth = kaggleAuth();
  if (!auth) {
    console.warn("KAGGLE_TOKEN not set, skipping datasets");
    return [];
  }

  const username = entries[0].slug.split("/")[0];
  const descMap = new Map(entries.map((e) => [e.slug, e.description]));

  try {
    const res = await fetch(
      `https://www.kaggle.com/api/v1/datasets/list?user=${username}&pageSize=50&sortBy=updated`,
      { headers: { Authorization: auth } },
    );

    if (!res.ok) {
      console.warn(`Kaggle datasets fetch failed: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return data
      .filter((item: any) => descMap.has(item.ref))
      .map((item: any) => ({
        name: item.title,
        url: `https://www.kaggle.com/datasets/${item.ref}`,
        description: descMap.get(item.ref) || "",
        updatedAt: item.lastUpdated,
      }));
  } catch (err) {
    console.warn("Error fetching Kaggle datasets:", err);
    return [];
  }
}
