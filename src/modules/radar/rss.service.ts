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

  const items = (feed.items || []).map((item) => {
    const publishedAt = item.isoDate || item.pubDate
      ? new Date(item.isoDate || item.pubDate || Date.now()).toISOString()
      : new Date().toISOString();

    const summary = item.contentSnippet || item.summary || item.content || "";
    // Clean snippet
    const cleanSummary = summary.replace(/<[^>]*>?/gm, "").trim().slice(0, 500);

    return {
      title: item.title || "Untitled Item",
      url: item.link || feedUrl,
      author: item.creator || (item as unknown as { author?: string }).author || feed.title || null,
      summary: cleanSummary,
      content: item.content || item["content:encoded"] || cleanSummary,
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
