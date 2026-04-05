import { useState } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  async function runCheck() {
    if (!handle.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handle.replace("@", "").trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setResult(data);
      setHistory((prev) => [
        { handle: handle.replace("@", ""), score: data.analysis.overallScore, time: new Date() },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const score = result?.analysis?.overallScore;
  const scoreColor = score === "safe" ? "#27500A" : score === "warning" ? "#633806" : "#791F1F";
  const scoreBg = score === "safe" ? "#EAF3DE" : score === "warning" ? "#FAEEDA" : "#FCEBEB";
  const scoreIcon = score === "safe" ? "✓" : score === "warning" ? "!" : "✕";
  const scoreLabel = score === "safe" ? "No violations detected" : score === "warning" ? "Some concerns found" : "Likely violations";

  return (
    <>
      <Head>
        <title>X Spam Checker — Analyze Your Account</title>
        <meta name="description" content="Check if your X (Twitter) account is breaking spam rules" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <main className={styles.main}>
        <div className={styles.container}>

          {/* Header */}
          <div className={styles.header}>
            <div className={styles.logo}>𝕏</div>
            <h1>Spam Compliance Checker</h1>
            <p>Enter any X handle to automatically analyze it against X's platform rules</p>
          </div>

          {/* Search */}
          <div className={styles.searchCard}>
            <div className={styles.inputRow}>
              <span className={styles.at}>@</span>
              <input
                type="text"
                className={styles.input}
                placeholder="username"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runCheck()}
              />
              <button className={styles.btn} onClick={runCheck} disabled={loading || !handle.trim()}>
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.errorBox}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className={styles.loadingBox}>
              <div className={styles.spinner}></div>
              <div>
                <p className={styles.loadingTitle}>Fetching account data from X...</p>
                <p className={styles.loadingSubtitle}>Analyzing tweets, follower patterns, and activity against X's rules</p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className={styles.results}>

              {/* Score banner */}
              <div className={styles.scoreBanner} style={{ background: scoreBg }}>
                <div className={styles.scoreCircle} style={{ background: scoreColor, color: "#fff" }}>
                  {scoreIcon}
                </div>
                <div>
                  <div className={styles.scoreHandle}>@{handle.replace("@", "")}</div>
                  <div className={styles.scoreLabel} style={{ color: scoreColor }}>{scoreLabel}</div>
                  <div className={styles.scoreSummary}>{result.analysis.summary}</div>
                </div>
                <div className={styles.riskBadge} style={{ background: scoreColor, color: "#fff" }}>
                  {result.analysis.riskLevel} risk
                </div>
              </div>

              {/* Stats row */}
              <div className={styles.statsRow}>
                {[
                  { label: "Followers", value: result.analysis.dataHighlights?.followers?.toLocaleString() },
                  { label: "Following", value: result.analysis.dataHighlights?.following?.toLocaleString() },
                  { label: "Follower ratio", value: result.analysis.dataHighlights?.followerRatio },
                  { label: "Account age", value: `${result.analysis.dataHighlights?.accountAgeDays} days` },
                  { label: "Total tweets", value: result.analysis.dataHighlights?.totalTweets?.toLocaleString() },
                ].map((s) => (
                  <div key={s.label} className={styles.statCard}>
                    <div className={styles.statValue}>{s.value ?? "—"}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Checks */}
              <h2 className={styles.sectionTitle}>Rule checks</h2>
              <div className={styles.checksList}>
                {result.analysis.checks?.map((check, i) => {
                  const iconColor = check.status === "pass" ? "#27500A" : check.status === "warn" ? "#633806" : "#791F1F";
                  const iconBg = check.status === "pass" ? "#EAF3DE" : check.status === "warn" ? "#FAEEDA" : "#FCEBEB";
                  const icon = check.status === "pass" ? "✓" : check.status === "warn" ? "!" : "✕";
                  return (
                    <div key={i} className={styles.checkItem}>
                      <div className={styles.checkIcon} style={{ background: iconBg, color: iconColor }}>{icon}</div>
                      <div>
                        <div className={styles.checkName}>{check.name}</div>
                        <div className={styles.checkDetail}>{check.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recommendations */}
              {result.analysis.recommendations?.length > 0 && (
                <>
                  <h2 className={styles.sectionTitle}>Recommendations</h2>
                  <div className={styles.recsBox}>
                    {result.analysis.recommendations.map((r, i) => (
                      <div key={i} className={styles.recItem}>
                        <span className={styles.recDot}>›</span>
                        {r}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Raw data toggle */}
              <details className={styles.rawData}>
                <summary>View raw account data</summary>
                <pre>{JSON.stringify(result.rawData, null, 2)}</pre>
              </details>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className={styles.history}>
              <h2 className={styles.sectionTitle}>Recent checks</h2>
              {history.map((h, i) => {
                const bg = h.score === "safe" ? "#EAF3DE" : h.score === "warning" ? "#FAEEDA" : "#FCEBEB";
                const fg = h.score === "safe" ? "#27500A" : h.score === "warning" ? "#633806" : "#791F1F";
                const label = h.score === "safe" ? "Safe" : h.score === "warning" ? "Warning" : "Danger";
                return (
                  <div key={i} className={styles.historyItem}>
                    <div>
                      <span className={styles.historyHandle}>@{h.handle}</span>
                      <span className={styles.historyTime}>{h.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <span className={styles.badge} style={{ background: bg, color: fg }}>{label}</span>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>
    </>
  );
}
