export interface ProjectEntry {
  slug: string;
  description: string;
}

export interface GitHubRepo {
  name: string;
  url: string;
  description: string;
  updatedAt: string;
}

export async function fetchRepos(entries: ProjectEntry[]): Promise<GitHubRepo[]> {
  const results: GitHubRepo[] = [];

  for (const entry of entries) {
    try {
      const res = await fetch(`https://api.github.com/repos/${entry.slug}`, {
        headers: { Accept: "application/vnd.github.v3+json" },
      });

      if (!res.ok) {
        console.warn(`Failed to fetch ${entry.slug}: ${res.status}`);
        continue;
      }

      const data = await res.json();
      results.push({
        name: data.name,
        url: data.html_url,
        description: entry.description || data.description || "",
        updatedAt: data.pushed_at,
      });
    } catch (err) {
      console.warn(`Error fetching ${entry.slug}:`, err);
    }
  }

  return results;
}
