import Link from "next/link";
import { requireSuperadmin } from "@/lib/require-superadmin";

export const dynamic =
    "force-dynamic";

export default async function AdminDashboard() {
    const { admin } =
        await requireSuperadmin();

    const [
        profilesResult,
        generationsResult,
        votesResult,
    ] = await Promise.all([
        admin
            .from("profiles")
            .select(
                "id, username, created_at"
            ),

        admin
            .from("caption_generations")
            .select(
                "id, caption, vibe, created_at"
            ),

        admin
            .from("votes")
            .select(
                "id, generation_id, value, created_at"
            ),
    ]);

    const profiles =
        profilesResult.data ?? [];

    const generations =
        generationsResult.data ?? [];

    const votes =
        votesResult.data ?? [];

    const upvotes =
        votes.filter(
            (vote) => vote.value === 1
        ).length;

    const downvotes =
        votes.filter(
            (vote) => vote.value === -1
        ).length;

    const netScore =
        upvotes - downvotes;

    const averageVotes =
        generations.length > 0
            ? (
                votes.length /
                generations.length
            ).toFixed(1)
            : "0";

    const vibeCounts:
        Record<string, number> = {};

    for (
        const generation of generations
        ) {
        const vibe =
            generation.vibe ??
            "No vibe";

        vibeCounts[vibe] =
            (vibeCounts[vibe] ?? 0) +
            1;
    }

    const sortedVibes =
        Object.entries(
            vibeCounts
        ).sort(
            (a, b) =>
                b[1] - a[1]
        );

    const topVibe =
        sortedVibes[0]?.[0] ??
        "No data yet";

    const maxVibeCount =
        Math.max(
            ...sortedVibes.map(
                ([, count]) => count
            ),
            1
        );

    const scores:
        Record<string, number> = {};

    for (const vote of votes) {
        scores[vote.generation_id] =
            (scores[
                vote.generation_id
                ] ?? 0) + vote.value;
    }

    const topGeneration =
        [...generations].sort(
            (a, b) =>
                (scores[b.id] ?? 0) -
                (scores[a.id] ?? 0)
        )[0];

    return (
        <>
            <header className="admin-page-header">
                <p className="admin-kicker">
                    COMMUNITY OVERVIEW
                </p>

                <h2>
                    Dashboard
                </h2>

                <p className="admin-page-subtitle">
                    A snapshot of activity across
                    Morningside Caption Club.
                </p>
            </header>

            <section className="stat-grid">
                <Link
                    href="/admin/profiles"
                    className="stat-card stat-card-link"
                >
        <span>
            Profiles
        </span>

                    <strong>
                        {profiles.length}
                    </strong>

                    <small className="stat-description">
                        View all registered users →
                    </small>
                </Link>

                <Link
                    href="/admin/media"
                    className="stat-card stat-card-link"
                >
        <span>
            AI Captions
        </span>

                    <strong>
                        {generations.length}
                    </strong>

                    <small className="stat-description">
                        Manage generated content →
                    </small>
                </Link>

                <Link
                    href="/admin/votes"
                    className="stat-card stat-card-link"
                >
        <span>
            Total Votes
        </span>

                    <strong>
                        {votes.length}
                    </strong>

                    <small className="stat-description">
                        View all ratings →
                    </small>
                </Link>

                <Link
                    href="/admin/votes"
                    className="stat-card stat-card-link"
                >
        <span>
            Net Score
        </span>

                    <strong>
                        {netScore}
                    </strong>

                    <small className="stat-description">
                        Upvotes − downvotes
                    </small>
                </Link>

                <Link
                    href="/admin/votes"
                    className="stat-card stat-card-link"
                >
        <span>
            Votes / Caption
        </span>

                    <strong>
                        {averageVotes}
                    </strong>

                    <small className="stat-description">
                        Average votes received per caption
                    </small>
                </Link>

                <Link
                    href="/admin/media"
                    className="stat-card stat-card-link"
                >
        <span>
            Top Vibe
        </span>

                    <strong className="stat-text">
                        {topVibe}
                    </strong>

                    <small className="stat-description">
                        Most frequently used caption vibe →
                    </small>
                </Link>
            </section>

            <div className="dashboard-grid">
                <section className="admin-card">
                    <div className="card-heading-row">
                        <div>
                            <h3>
                                Vote sentiment
                            </h3>

                            <p className="card-description">
                                How users are rating captions overall.
                            </p>
                        </div>

                        <Link
                            href="/admin/votes"
                            className="card-link"
                        >
                            View votes →
                        </Link>
                    </div>

                    <div className="sentiment-row">
                        <div className="sentiment-stat">
                            <span>
                                ↑ Upvotes
                            </span>

                            <strong>
                                {upvotes}
                            </strong>
                        </div>

                        <div className="sentiment-stat">
                            <span>
                                ↓ Downvotes
                            </span>

                            <strong>
                                {downvotes}
                            </strong>
                        </div>
                    </div>
                </section>

                <section className="admin-card">
                    <h3>
                        Top caption
                    </h3>

                    {topGeneration ? (
                        <>
                            <p className="top-caption">
                                “
                                {
                                    topGeneration.caption
                                }
                                ”
                            </p>

                            <p className="muted">
                                Score:{" "}
                                {scores[
                                    topGeneration.id
                                    ] ?? 0}
                            </p>
                        </>
                    ) : (
                        <p className="muted">
                            No captions yet.
                        </p>
                    )}
                </section>
            </div>

            <section className="admin-card vibe-card">
                <div className="card-heading-row">
                    <div>
                        <h3>
                            Vibe breakdown
                        </h3>

                        <p className="card-description">
                            Distribution of vibes selected for AI-generated captions.
                        </p>
                    </div>

                    <Link
                        href="/admin/media"
                        className="card-link"
                    >
                        View media →
                    </Link>
                </div>

                {sortedVibes.length >
                0 ? (
                    <div className="bar-list">
                        {sortedVibes.map(
                            ([
                                 vibe,
                                 count,
                             ]) => (
                                <div
                                    key={
                                        vibe
                                    }
                                    className="bar-row"
                                >
                                    <span>
                                        {
                                            vibe
                                        }
                                    </span>

                                    <div className="bar-track">
                                        <div
                                            className="bar-fill"
                                            style={{
                                                width: `${(
                                                    count /
                                                    maxVibeCount
                                                ) *
                                                100}%`,
                                            }}
                                        />
                                    </div>

                                    <strong>
                                        {
                                            count
                                        }
                                    </strong>
                                </div>
                            )
                        )}
                    </div>
                ) : (
                    <p className="muted">
                        No vibe data yet.
                    </p>
                )}
            </section>
        </>
    );
}