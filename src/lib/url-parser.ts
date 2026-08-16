/**
 * Extract content ID and account ID from social media URLs.
 * Handles various URL formats and normalizes them.
 */

export interface ParsedUrl {
  platform: "instagram" | "tiktok"
  accountId: string // username/account identifier
  contentId: string // specific post/reel/video ID
}

/**
 * Parse Instagram URL to extract account and content IDs.
 *
 * Supported formats:
 * - https://instagram.com/reel/ABC123
 * - https://www.instagram.com/reel/ABC123/
 * - https://instagram.com/p/ABC123
 * - https://instagram.com/stories/username/123456
 * - https://instagram.com/tv/ABC123
 */
export function parseInstagramUrl(url: string): ParsedUrl | null {
  try {
    const u = new URL(url)
    const path = u.pathname.replace(/\/+$/, "") // strip trailing slash
    const parts = path.split("/").filter(Boolean)

    // /reel/ID, /p/ID, /tv/ID
    if (parts.length >= 2 && ["reel", "p", "tv"].includes(parts[0])) {
      const contentId = parts[1]
      // Account ID not in URL — we'll use contentId as the account key
      // since we can't extract the account from the URL for these formats
      return {
        platform: "instagram",
        accountId: contentId, // Same as content for /reel/ and /p/ URLs
        contentId,
      }
    }

    // /stories/username/storyId
    if (parts.length >= 3 && parts[0] === "stories") {
      return {
        platform: "instagram",
        accountId: parts[1].toLowerCase(),
        contentId: parts[2],
      }
    }

    // /username (profile URL — no specific content)
    if (parts.length === 1) {
      return {
        platform: "instagram",
        accountId: parts[0].toLowerCase(),
        contentId: parts[0].toLowerCase(),
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Parse TikTok URL to extract account and content IDs.
 *
 * Supported formats:
 * - https://tiktok.com/@username/video/1234567890
 * - https://www.tiktok.com/@username/video/1234567890
 * - https://vm.tiktok.com/ABC123/
 */
export function parseTikTokUrl(url: string): ParsedUrl | null {
  try {
    const u = new URL(url)
    const path = u.pathname.replace(/\/+$/, "")
    const parts = path.split("/").filter(Boolean)

    // /@username/video/ID
    if (parts.length >= 3 && parts[0].startsWith("@") && parts[1] === "video") {
      return {
        platform: "tiktok",
        accountId: parts[0].toLowerCase(),
        contentId: parts[2],
      }
    }

    // /@username (profile — no specific content)
    if (parts.length === 1 && parts[0].startsWith("@")) {
      return {
        platform: "tiktok",
        accountId: parts[0].toLowerCase(),
        contentId: parts[0].toLowerCase(),
      }
    }

    // Short URL (vm.tiktok.com) — use the short code as both account and content
    if (parts.length >= 1) {
      return {
        platform: "tiktok",
        accountId: parts[0],
        contentId: parts[0],
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Parse any supported social media URL.
 */
export function parseSocialUrl(url: string, platform: string): ParsedUrl | null {
  switch (platform) {
    case "instagram":
      return parseInstagramUrl(url)
    case "tiktok":
      return parseTikTokUrl(url)
    default:
      return null
  }
}
