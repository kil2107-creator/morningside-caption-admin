import Link from "next/link";

import { requireSuperadmin } from "@/lib/require-superadmin";

export const dynamic =
    "force-dynamic";

export default async function AdminDashboard() {
    const { admin } =
        await requireSuperadmin();

    /*
     * Load all dashboard data in parallel.
     */
    const [
        profilesResult,
        generationsResult,
        votesResult,
        requestsResult,
        responsesResult,
        chainsResult,
        modelsResult,
    ] = await Promise.all([
        admin
            .from("profiles")
            .select(
                "id, username, created_at"
            ),

        admin
            .from(
                "caption_generations"
            )
            .select(
                "id, caption, vibe, created_at"
            ),

        admin
            .from("votes")
            .select(
                "id, generation_id, value, created_at"
            ),

        admin
            .from(
                "generation_requests"
            )
            .select(
                "id, status, started_at, completed_at"
            ),

        admin
            .from(
                "llm_responses"
            )
            .select(
                "id, llm_model_id, latency_ms, success, created_at"
            ),

        admin
            .from(
                "prompt_chains"
            )
            .select(
                "id, name, is_active"
            ),

        admin
            .from(
                "llm_models"
            )
            .select(
                "id, name, model_key"
            ),
    ]);


    /*
     * Surface database problems instead of
     * silently showing misleading zeroes.
     */
    if (profilesResult.error) {
        throw new Error(
            profilesResult.error.message
        );
    }

    if (generationsResult.error) {
        throw new Error(
            generationsResult.error.message
        );
    }

    if (votesResult.error) {
        throw new Error(
            votesResult.error.message
        );
    }

    if (requestsResult.error) {
        throw new Error(
            requestsResult.error.message
        );
    }

    if (responsesResult.error) {
        throw new Error(
            responsesResult.error.message
        );
    }

    if (chainsResult.error) {
        throw new Error(
            chainsResult.error.message
        );
    }

    if (modelsResult.error) {
        throw new Error(
            modelsResult.error.message
        );
    }


    /*
     * --------------------------------------------------
     * BASIC DATA
     * --------------------------------------------------
     */

    const profiles =
        profilesResult.data ?? [];

    const generations =
        generationsResult.data ?? [];

    const votes =
        votesResult.data ?? [];

    const generationRequests =
        requestsResult.data ?? [];

    const llmResponses =
        responsesResult.data ?? [];

    const promptChains =
        chainsResult.data ?? [];

    const models =
        modelsResult.data ?? [];


    /*
     * --------------------------------------------------
     * VOTING METRICS
     * --------------------------------------------------
     */

    const upvotes =
        votes.filter(
            (vote) =>
                vote.value === 1
        ).length;

    const downvotes =
        votes.filter(
            (vote) =>
                vote.value === -1
        ).length;

    const netScore =
        upvotes -
        downvotes;


    /*
     * --------------------------------------------------
     * GENERATION REQUEST METRICS
     * --------------------------------------------------
     */

    const successfulRequests =
        generationRequests.filter(
            (request) =>
                request.status ===
                "succeeded"
        ).length;

    const failedRequests =
        generationRequests.filter(
            (request) =>
                request.status ===
                "failed"
        ).length;

    const pendingRequests =
        generationRequests.filter(
            (request) =>
                request.status ===
                "started"
        ).length;

    /*
     * Only completed requests count toward
     * the success-rate denominator.
     */
    const completedRequests =
        successfulRequests +
        failedRequests;

    const successRate =
        completedRequests > 0
            ? (
                (successfulRequests /
                    completedRequests) *
                100
            ).toFixed(1)
            : "0.0";


    /*
     * --------------------------------------------------
     * LLM RESPONSE METRICS
     * --------------------------------------------------
     */

    const successfulResponses =
        llmResponses.filter(
            (response) =>
                response.success
        );

    const responsesWithLatency =
        successfulResponses.filter(
            (response) =>
                typeof response.latency_ms ===
                "number"
        );

    const averageLatencyMs =
        responsesWithLatency.length >
        0
            ? responsesWithLatency.reduce(
                (
                    total,
                    response
                ) =>
                    total +
                    (response.latency_ms ??
                        0),
                0
            ) /
            responsesWithLatency.length
            : 0;

    const averageLatencySeconds =
        (
            averageLatencyMs /
            1000
        ).toFixed(2);


    /*
     * --------------------------------------------------
     * MOST USED MODEL
     * --------------------------------------------------
     *
     * Count successful responses by model.
     */

    const modelUsage:
        Record<string, number> = {};

    for (
        const response of
        successfulResponses
        ) {
        if (
            response.llm_model_id
        ) {
            modelUsage[
                response.llm_model_id
                ] =
                (modelUsage[
                    response.llm_model_id
                    ] ?? 0) + 1;
        }
    }

    const mostUsedModelEntry =
        Object.entries(
            modelUsage
        ).sort(
            (a, b) =>
                b[1] - a[1]
        )[0];

    const modelById =
        new Map(
            models.map(
                (model) => [
                    model.id,
                    model,
                ]
            )
        );

    const mostUsedModel =
        mostUsedModelEntry
            ? modelById.get(
                mostUsedModelEntry[0]
            )
            : null;

    const mostUsedModelCount =
        mostUsedModelEntry?.[1] ??
        0;


    /*
     * --------------------------------------------------
     * TOP VIBE
     * --------------------------------------------------
     */

    const vibeCounts:
        Record<string, number> = {};

    for (
        const generation of
        generations
        ) {
        const vibe =
            generation.vibe ??
            "No vibe";

        vibeCounts[vibe] =
            (vibeCounts[vibe] ??
                0) + 1;
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
                ([, count]) =>
                    count
            ),
            1
        );


    /*
     * --------------------------------------------------
     * TOP CAPTION
     * --------------------------------------------------
     */

    const scores:
        Record<string, number> = {};

    for (const vote of votes) {
        scores[
            vote.generation_id
            ] =
            (scores[
                vote.generation_id
                ] ?? 0) +
            vote.value;
    }

    const topGeneration =
        generations.length >
        0
            ? [...generations].sort(
                (a, b) =>
                    (scores[
                        b.id
                        ] ?? 0) -
                    (scores[
                        a.id
                        ] ?? 0)
            )[0]
            : null;


    /*
     * --------------------------------------------------
     * ACTIVE PROMPT CHAINS
     * --------------------------------------------------
     */

    const activePromptChains =
        promptChains.filter(
            (chain) =>
                chain.is_active
        ).length;


    return (
        <>
            {/* HEADER */}

            <header className="admin-page-header">
                <p className="admin-kicker">
                    COMMUNITY + AI
                    OBSERVABILITY
                </p>

                <h2>
                    Dashboard
                </h2>

                <p className="admin-page-subtitle">
                    Monitor community activity,
                    caption generation, AI
                    performance, and prompt
                    configuration across
                    Morningside Caption Club.
                </p>
            </header>


            {/* MAIN STATISTICS */}

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
                        Registered users →
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
                        {
                            generations.length
                        }
                    </strong>

                    <small className="stat-description">
                        Posted AI content →
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
                        All rating activity →
                    </small>
                </Link>


                <Link
                    href="/admin/generation-requests"
                    className="stat-card stat-card-link"
                >
                    <span>
                        Generation
                        Requests
                    </span>

                    <strong>
                        {
                            generationRequests.length
                        }
                    </strong>

                    <small className="stat-description">
                        All AI requests →
                    </small>
                </Link>


                <Link
                    href="/admin/generation-requests"
                    className="stat-card stat-card-link"
                >
                    <span>
                        Successful
                        Requests
                    </span>

                    <strong>
                        {
                            successfulRequests
                        }
                    </strong>

                    <small className="stat-description">
                        Completed successfully
                    </small>
                </Link>


                <Link
                    href="/admin/generation-requests"
                    className="stat-card stat-card-link"
                >
                    <span>
                        Failed Requests
                    </span>

                    <strong>
                        {failedRequests}
                    </strong>

                    <small className="stat-description">
                        Generation failures →
                    </small>
                </Link>


                <Link
                    href="/admin/llm-responses"
                    className="stat-card stat-card-link"
                >
                    <span>
                        LLM Responses
                    </span>

                    <strong>
                        {
                            llmResponses.length
                        }
                    </strong>

                    <small className="stat-description">
                        Individual model calls →
                    </small>
                </Link>


                <Link
                    href="/admin/llm-responses"
                    className="stat-card stat-card-link"
                >
                    <span>
                        Avg. LLM Latency
                    </span>

                    <strong className="stat-text">
                        {
                            averageLatencySeconds
                        }
                        s
                    </strong>

                    <small className="stat-description">
                        Successful model calls
                    </small>
                </Link>


                <Link
                    href="/admin/prompt-chains"
                    className="stat-card stat-card-link"
                >
                    <span>
                        Prompt Chains
                    </span>

                    <strong>
                        {
                            promptChains.length
                        }
                    </strong>

                    <small className="stat-description">
                        {activePromptChains}{" "}
                        active →
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
                        Most-used posted
                        caption vibe →
                    </small>
                </Link>


                <Link
                    href="/admin/models"
                    className="stat-card stat-card-link"
                >
                    <span>
                        Top Model
                    </span>

                    <strong className="stat-text">
                        {mostUsedModel?.name ??
                            "No data"}
                    </strong>

                    <small className="stat-description">
                        Most successful calls →
                    </small>
                </Link>


                <Link
                    href="/admin/generation-requests"
                    className="stat-card stat-card-link"
                >
                    <span>
                        Generation
                        Success
                    </span>

                    <strong className="stat-text">
                        {successRate}%
                    </strong>

                    <small className="stat-description">
                        Successful ÷ completed
                    </small>
                </Link>
            </section>


            {/* AI OBSERVABILITY */}

            <section
                className="admin-card"
                style={{
                    marginTop:
                        "24px",
                }}
            >
                <div className="admin-section-heading">
                    <h3>
                        AI Observability
                    </h3>

                    <p>
                        High-level health and
                        performance of caption
                        generation.
                    </p>
                </div>

                <div className="observability-grid">

                    {/* SUCCESS RATE */}

                    <div className="observability-metric">
                        <div className="observability-heading">
                            <span>
                                Generation
                                success rate
                            </span>

                            <strong>
                                {
                                    successRate
                                }
                                %
                            </strong>
                        </div>

                        <div className="observability-track">
                            <div
                                className="observability-fill"
                                style={{
                                    width: `${Math.min(
                                        Number(
                                            successRate
                                        ),
                                        100
                                    )}%`,
                                }}
                            />
                        </div>

                        <p>
                            {
                                successfulRequests
                            }{" "}
                            successful ·{" "}
                            {
                                failedRequests
                            }{" "}
                            failed
                            {pendingRequests >
                                0 &&
                                ` · ${pendingRequests} in progress`}
                        </p>
                    </div>


                    {/* RESPONSE TIME */}

                    <div className="observability-metric">
                        <span>
                            Average response
                            time
                        </span>

                        <strong className="observability-big-number">
                            {
                                averageLatencySeconds
                            }
                            s
                        </strong>

                        <p>
                            Average latency
                            across successful
                            LLM responses.
                        </p>

                        <Link
                            href="/admin/llm-responses"
                            className="observability-link"
                        >
                            View LLM responses →
                        </Link>
                    </div>


                    {/* MOST USED MODEL */}

                    <div className="observability-metric">
                        <span>
                            Most used model
                        </span>

                        <strong className="observability-model">
                            {mostUsedModel?.name ??
                                "No data yet"}
                        </strong>

                        <p>
                            {mostUsedModel
                                ? `${mostUsedModelCount} successful model call${
                                    mostUsedModelCount ===
                                    1
                                        ? ""
                                        : "s"
                                }.`
                                : "Generate captions to begin collecting model usage data."}
                        </p>

                        <Link
                            href="/admin/models"
                            className="observability-link"
                        >
                            Manage models →
                        </Link>
                    </div>
                </div>
            </section>


            {/* EXISTING WEEK 6 COMMUNITY INSIGHTS */}

            <div className="dashboard-grid">

                <section className="admin-card">
                    <div className="card-heading-row">
                        <div>
                            <h3>
                                Vote
                                sentiment
                            </h3>

                            <p className="card-description">
                                How users are
                                rating posted
                                captions overall.
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
                                {
                                    upvotes
                                }
                            </strong>
                        </div>

                        <div className="sentiment-stat">
                            <span>
                                ↓ Downvotes
                            </span>

                            <strong>
                                {
                                    downvotes
                                }
                            </strong>
                        </div>
                    </div>

                    <p
                        className="muted"
                        style={{
                            marginBottom:
                                0,
                        }}
                    >
                        Net score:{" "}
                        <strong>
                            {
                                netScore
                            }
                        </strong>{" "}
                        (upvotes −
                        downvotes)
                    </p>
                </section>


                <section className="admin-card">
                    <h3>
                        Top Caption
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


            {/* VIBE BREAKDOWN */}

            <section className="admin-card vibe-card">
                <div className="card-heading-row">
                    <div>
                        <h3>
                            Vibe
                            Breakdown
                        </h3>

                        <p className="card-description">
                            Distribution of
                            vibes used across
                            posted AI captions.
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
                                                width: `${
                                                    (count /
                                                        maxVibeCount) *
                                                    100
                                                }%`,
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