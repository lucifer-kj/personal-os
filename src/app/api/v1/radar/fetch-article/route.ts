import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { apiSuccess, apiError } from "@/lib/api/response";

export interface CleanArticleResponse {
  title: string;
  byline?: string;
  siteName: string;
  content: string;
  excerpt?: string;
  wordCount: number;
  readingTimeMinutes: number;
  discussionUrl?: string;
  commentsCount?: number;
  comments?: Array<{ author: string; text: string; time: string }>;
  url: string;
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError("UNAUTHORIZED", "Authentication required", undefined, 401);
  }

  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");
  const fallbackTitle = searchParams.get("title") || "Article Signal";

  if (!targetUrl) {
    return apiError("VALIDATION_ERROR", "Target URL is required", undefined, 400);
  }

  let domain = "";
  try {
    domain = new URL(targetUrl).hostname.replace(/^www\./, "");
  } catch {
    domain = "web";
  }

  try {
    // 1. If target is Hacker News item directly or discussion
    const hnMatch = targetUrl.match(/news\.ycombinator\.com\/item\?id=(\d+)/);
    if (hnMatch) {
      const hnId = hnMatch[1];
      const hnRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${hnId}.json`, {
        signal: AbortSignal.timeout(6000),
      });

      if (hnRes.ok) {
        const hnData = await hnRes.json();
        const storyTitle = hnData.title || fallbackTitle;
        const storyAuthor = hnData.by || "HN Community";
        const externalStoryUrl = hnData.url;
        const commentKids = Array.isArray(hnData.kids) ? hnData.kids.slice(0, 4) : [];

        // Fetch top comments in parallel
        const comments: Array<{ author: string; text: string; time: string }> = [];
        await Promise.all(
          commentKids.map(async (kid: number) => {
            try {
              const cRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${kid}.json`, {
                signal: AbortSignal.timeout(4000),
              });
              if (cRes.ok) {
                const cData = await cRes.json();
                if (cData && cData.text) {
                  const cleanComment = cData.text
                    .replace(/<p>/gi, "\n\n")
                    .replace(/<[^>]+>/g, "")
                    .replace(/&#x27;/g, "'")
                    .replace(/&quot;/g, '"')
                    .replace(/&gt;/g, ">")
                    .replace(/&lt;/g, "<")
                    .trim();
                  comments.push({
                    author: cData.by || "contributor",
                    text: cleanComment.slice(0, 300),
                    time: new Date((cData.time || Date.now() / 1000) * 1000).toLocaleDateString(),
                  });
                }
              }
            } catch {
              // Ignore single comment fetch errors
            }
          })
        );

        // If story points to an external article, fetch that article's text
        let articleBody = hnData.text ? hnData.text.replace(/<[^>]+>/g, " ").trim() : "";
        if (externalStoryUrl) {
          try {
            const extRes = await fetch(externalStoryUrl, {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              },
              signal: AbortSignal.timeout(6000),
            });
            if (extRes.ok) {
              const html = await extRes.text();
              const extracted = extractTextFromHtml(html);
              if (extracted.length > 200) {
                articleBody = extracted;
              }
            }
          } catch {
            // Keep fallback
          }
        }

        if (!articleBody) {
          articleBody = `Discussion thread regarding "${storyTitle}". Link to source: ${externalStoryUrl || targetUrl}.\n\nPoints: ${hnData.score || 0} • Comments: ${hnData.descendants || comments.length}\n\nSubmitted by ${storyAuthor}. Review the discussion and insights on the right.`;
        }

        const words = articleBody.split(/\s+/).filter(Boolean).length;
        const result: CleanArticleResponse = {
          title: storyTitle,
          byline: `${storyAuthor} • Hacker News`,
          siteName: externalStoryUrl ? new URL(externalStoryUrl).hostname : "news.ycombinator.com",
          content: articleBody,
          excerpt: articleBody.slice(0, 200) + "...",
          wordCount: words,
          readingTimeMinutes: Math.max(1, Math.round(words / 200)),
          discussionUrl: targetUrl,
          commentsCount: hnData.descendants || comments.length,
          comments,
          url: externalStoryUrl || targetUrl,
        };

        return apiSuccess(result);
      }
    }

    // 2. Generic Web Fetch
    const pageRes = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(7000),
    });

    if (!pageRes.ok) {
      throw new Error(`Remote host returned HTTP ${pageRes.status}`);
    }

    const html = await pageRes.text();
    const extractedContent = extractTextFromHtml(html);

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const parsedTitle = titleMatch ? titleMatch[1].trim() : fallbackTitle;

    // Extract author / byline
    const authorMatch =
      html.match(/<meta\s+name=["']author["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+property=["']article:author["']\s+content=["']([^"']+)["']/i);
    const byline = authorMatch ? authorMatch[1].trim() : domain;

    const words = extractedContent.split(/\s+/).filter(Boolean).length;

    const responseData: CleanArticleResponse = {
      title: parsedTitle,
      byline: `${byline} • ${domain}`,
      siteName: domain,
      content: extractedContent || `Article preview for ${parsedTitle}. Visit source link to read full document.`,
      excerpt: extractedContent.slice(0, 220) + "...",
      wordCount: words,
      readingTimeMinutes: Math.max(1, Math.round(words / 200)),
      url: targetUrl,
    };

    return apiSuccess(responseData);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch article";
    // Return fallback graceful preview rather than error out
    return apiSuccess({
      title: fallbackTitle,
      byline: domain,
      siteName: domain,
      content: `Unable to extract article body directly (${errorMsg}). Click "Original" to view the publication directly in your browser.`,
      wordCount: 0,
      readingTimeMinutes: 1,
      url: targetUrl,
    });
  }
}

/**
 * Lightweight HTML parser that strips scripts, styles, headers, and extracts readable text paragraphs
 */
function extractTextFromHtml(html: string): string {
  let text = html;

  // Remove scripts, styles, iframes, svgs, noscripts
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
  text = text.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ");
  text = text.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ");
  text = text.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, " ");
  text = text.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ");
  text = text.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ");

  // Isolate <article> or <main> if present
  const articleMatch = text.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const mainMatch = text.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (articleMatch) {
    text = articleMatch[1];
  } else if (mainMatch) {
    text = mainMatch[1];
  }

  // Preserve paragraph and heading breaks
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<\/h[1-6]>/gi, "\n\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<li>/gi, "\n• ");

  // Strip remaining tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  // Format double spaces and newlines
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 25);

  return paragraphs.slice(0, 30).join("\n\n");
}
