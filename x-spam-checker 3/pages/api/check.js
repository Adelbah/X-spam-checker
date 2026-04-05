import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Fetch user profile from X API
async function fetchXProfile(username) {
  const url = `https://api.twitter.com/2/users/by/username/${username}?user.fields=public_metrics,created_at,description,entities,location,pinned_tweet_id,profile_image_url,protected,url,verified`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.X_BEARER_TOKEN}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.errors?.[0]?.detail || "User not found");
  }
  return res.json();
}

// Fetch recent tweets from X API
async function fetchRecentTweets(userId) {
  const url = `https://api.twitter.com/2/users/${userId}/tweets?max_results=100&tweet.fields=created_at,public_metrics,text,referenced_tweets&exclude=retweets`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.X_BEARER_TOKEN}` },
  });
  if (!res.ok) return { data: [] };
  return res.json();
}

// Analyze posting patterns from tweets
function analyzePostingPatterns(tweets) {
  if (!tweets || tweets.length === 0) return null;

  const now = new Date();
  const byDay = {};
  const byHour = {};
  let totalLikes = 0;
  let totalReplies = 0;
  let totalRetweets = 0;
  const textLengths = [];
  const texts = tweets.map((t) => t.text.toLowerCase());

  // Check for duplicate/near-duplicate content
  const duplicateCount = texts.filter(
    (text, i) => texts.findIndex((t) => t === text) !== i
  ).length;

  tweets.forEach((tweet) => {
    const date = new Date(tweet.created_at);
    const dayKey = date.toISOString().split("T")[0];
    const hour = date.getHours();
    byDay[dayKey] = (byDay[dayKey] || 0) + 1;
    byHour[hour] = (byHour[hour] || 0) + 1;
    totalLikes += tweet.public_metrics?.like_count || 0;
    totalReplies += tweet.public_metrics?.reply_count || 0;
    totalRetweets += tweet.public_metrics?.retweet_count || 0;
    textLengths.push(tweet.text.length);
  });

  const days = Object.values(byDay);
  const maxPostsInDay = Math.max(...days, 0);
  const avgPostsPerDay =
    days.length > 0 ? (days.reduce((a, b) => a + b, 0) / days.length).toFixed(1) : 0;
  const avgLikes =
    tweets.length > 0 ? (totalLikes / tweets.length).toFixed(1) : 0;
  const avgReplies =
    tweets.length > 0 ? (totalReplies / tweets.length).toFixed(1) : 0;
  const avgRetweets =
    tweets.length > 0 ? (totalRetweets / tweets.length).toFixed(1) : 0;
  const avgLength =
    textLengths.length > 0
      ? Math.round(textLengths.reduce((a, b) => a + b, 0) / textLengths.length)
      : 0;

  // Find peak posting hours
  const peakHour = Object.entries(byHour).sort((a, b) => b[1] - a[1])[0];

  return {
    totalTweetsAnalyzed: tweets.length,
    avgPostsPerDay,
    maxPostsInDay,
    avgLikes,
    avgReplies,
    avgRetweets,
    avgLength,
    duplicateCount,
    peakHour: peakHour ? `${peakHour[0]}:00 (${peakHour[1]} tweets)` : "N/A",
    sampleTweets: tweets.slice(0, 5).map((t) => t.text),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { handle } = req.body;
  if (!handle) return res.status(400).json({ error: "Handle is required" });

  try {
    // 1. Fetch profile
    const profileData = await fetchXProfile(handle.replace("@", ""));
    const user = profileData.data;
    const metrics = user.public_metrics;

    // 2. Fetch recent tweets
    const tweetsData = await fetchRecentTweets(user.id);
    const patterns = analyzePostingPatterns(tweetsData.data);

    // 3. Calculate ratios
    const followerRatio =
      metrics.following_count > 0
        ? (metrics.followers_count / metrics.following_count).toFixed(2)
        : "N/A";
    const accountAgeDays = Math.floor(
      (new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)
    );
    const tweetsPerDay =
      accountAgeDays > 0
        ? (metrics.tweet_count / accountAgeDays).toFixed(1)
        : "N/A";

    // 4. Build data summary for Claude
    const dataSummary = {
      handle,
      accountCreated: user.created_at,
      accountAgeDays,
      bio: user.description || "No bio",
      verified: user.verified,
      protected: user.protected,
      followers: metrics.followers_count,
      following: metrics.following_count,
      followerRatio,
      totalTweets: metrics.tweet_count,
      totalListed: metrics.listed_count,
      lifetimeTweetsPerDay: tweetsPerDay,
      recentActivity: patterns,
    };

    // 5. Send to Claude for analysis
    const claudeResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `You are an X (Twitter) platform rules and spam policy expert. Analyze this account data against X's official platform manipulation and spam policies.

Account Data:
${JSON.stringify(dataSummary, null, 2)}

X's key spam rules include:
- Posting limits: X recommends no more than 2,400 tweets/day; heavy posting can trigger spam filters
- Follow/unfollow: Following large numbers aggressively or follow-unfollow loops are violations
- Follower ratio: Very low follower/following ratio (e.g. following 10x more than followers) is a spam signal
- Engagement: Artificially inflating engagement, buying followers/likes is prohibited
- Duplicate content: Repeatedly posting identical or near-identical content is spam
- New accounts: New accounts posting heavily are flagged more aggressively
- Coordinated behavior: Using multiple accounts for the same agenda is banned

Return ONLY a valid JSON object (no markdown, no backticks, no extra text) with this exact structure:
{
  "overallScore": "safe" | "warning" | "danger",
  "summary": "2-3 sentence plain English summary of the account's spam risk",
  "riskLevel": "Low" | "Medium" | "High" | "Critical",
  "checks": [
    {
      "name": "check name",
      "status": "pass" | "warn" | "fail",
      "detail": "specific explanation with numbers from the data"
    }
  ],
  "recommendations": ["specific actionable recommendation 1", "..."],
  "dataHighlights": {
    "followers": ${metrics.followers_count},
    "following": ${metrics.following_count},
    "followerRatio": "${followerRatio}",
    "accountAgeDays": ${accountAgeDays},
    "totalTweets": ${metrics.tweet_count}
  }
}

Include checks for: posting frequency, follower/following ratio, account age vs activity, engagement authenticity, content duplication, bio/profile completeness, recent posting patterns. Be specific with numbers.`,
        },
      ],
    });

    const text = claudeResponse.content.map((c) => c.text || "").join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(clean);

    return res.status(200).json({ success: true, analysis, rawData: dataSummary });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Analysis failed" });
  }
}
