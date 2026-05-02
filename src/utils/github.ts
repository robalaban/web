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

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [604800, "week"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];

  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) {
      return `${count} ${label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
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
