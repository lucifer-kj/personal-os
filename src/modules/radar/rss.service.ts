import Parser from "rss-parser";

export interface ParsedFeedResult {
  title: string;
  description?: string;
  siteUrl?: string;
  items: Array<{
    title: string;
    url: string;
    author?: string | null;
    summary?: string | null;
    content?: string | null;
    publishedAt: string;
  }>;
}

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Personal-OS-Radar/1.0",
    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
  },
});

export async function fetchAndParseFeed(feedUrl: string): Promise<ParsedFeedResult> {
  const feed = await parser.parseURL(feedUrl);

  // Cap at 30 most recent items to avoid swamping the database
  const items = (feed.items || []).slice(0, 30).map((item) => {
    const publishedAt = item.isoDate || item.pubDate
      ? new Date(item.isoDate || item.pubDate || Date.now()).toISOString()
      : new Date().toISOString();

    const summary = item.contentSnippet || item.summary || item.content || "";
    // Clean snippet
    const cleanSummary = summary.replace(/<[^>]*>?/gm, "").trim().slice(0, 500);
    // Sanitize and cap content body to 15,000 chars to prevent storage bloat
    const rawContent = item.content || item["content:encoded"] || cleanSummary;
    const cleanContent = typeof rawContent === "string" ? rawContent.slice(0, 15000) : cleanSummary;

    return {
      title: item.title || "Untitled Item",
      url: item.link || feedUrl,
      author: item.creator || (item as unknown as { author?: string }).author || feed.title || null,
      summary: cleanSummary,
      content: cleanContent,
      publishedAt,
    };
  });

  return {
    title: feed.title || "Untitled Feed",
    description: feed.description,
    siteUrl: feed.link,
    items,
  };
}
