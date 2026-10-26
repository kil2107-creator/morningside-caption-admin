import { requireSuperadmin } from "@/lib/require-superadmin";

export const dynamic =
    "force-dynamic";

export default async function GenerationRequestsPage() {
    const { admin } =
        await requireSuperadmin();

    const [
        requestsResult,
        profilesResult,
        chainsResult,
    ] = await Promise.all([
        admin
            .from(
                "generation_requests"
            )
            .select(
                "id, user_id, prompt_chain_id, user_prompt, vibe, status, error_message, started_at, completed_at"
            )
            .order(
                "started_at",
                {
                    ascending:
                        false,
                }
            )
            .limit(100),

        admin
            .from("profiles")
            .select(
                "id, username"
            ),

        admin
            .from(
                "prompt_chains"
            )
            .select(
                "id, name"
            ),
    ]);

    if (
        requestsResult.error
    ) {
        throw new Error(
            requestsResult.error.message
        );
    }

    const profileById =
        new Map(
            (
                profilesResult.data ??
                []
            ).map(
                (profile) => [
                    profile.id,
                    profile.username,
                ]
            )
        );

    const chainById =
        new Map(
            (
                chainsResult.data ??
                []
            ).map(
                (chain) => [
                    chain.id,
                    chain.name,
                ]
            )
        );

    const requests =
        requestsResult.data ?? [];

    return (
        <>
            <header className="admin-page-header">
                <p className="admin-kicker">
                    OBSERVABILITY
                </p>

                <h2>
                    Generation Requests
                </h2>

                <p className="admin-page-subtitle">
                    View caption-generation attempts,
                    including successful requests,
                    failures, prompts, vibes, and
                    timing.
                </p>
            </header>

            <div className="table-wrap">
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>User</th>
                        <th>
                            Prompt
                        </th>
                        <th>Vibe</th>
                        <th>
                            Prompt Chain
                        </th>
                        <th>
                            Status
                        </th>
                        <th>
                            Started
                        </th>
                        <th>
                            Completed
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {requests.map(
                        (
                            request
                        ) => (
                            <tr
                                key={
                                    request.id
                                }
                            >
                                <td>
                                    @
                                    {profileById.get(
                                            request.user_id
                                        ) ??
                                        "unknown"}
                                </td>

                                <td
                                    style={{
                                        maxWidth:
                                            "330px",
                                    }}
                                >
                                    {
                                        request.user_prompt ??
                                        "—"
                                    }

                                    {request.error_message && (
                                        <p
                                            style={{
                                                margin:
                                                    "6px 0 0",
                                                color:
                                                    "var(--danger)",
                                                fontSize:
                                                    "12px",
                                            }}
                                        >
                                            {
                                                request.error_message
                                            }
                                        </p>
                                    )}
                                </td>

                                <td>
                                    {request.vibe ??
                                        "—"}
                                </td>

                                <td>
                                    {chainById.get(
                                            request.prompt_chain_id
                                        ) ??
                                        "—"}
                                </td>

                                <td>
                                        <span
                                            className={
                                                request.status ===
                                                "succeeded"
                                                    ? "status-pill status-success"
                                                    : request.status ===
                                                    "failed"
                                                        ? "status-pill status-failed"
                                                        : "status-pill status-neutral"
                                            }
                                        >
                                            {
                                                request.status
                                            }
                                        </span>
                                </td>

                                <td>
                                    {new Date(
                                        request.started_at
                                    ).toLocaleString()}
                                </td>

                                <td>
                                    {request.completed_at
                                        ? new Date(
                                            request.completed_at
                                        ).toLocaleString()
                                        : "—"}
                                </td>
                            </tr>
                        )
                    )}

                    {requests.length ===
                        0 && (
                            <tr>
                                <td
                                    colSpan={
                                        7
                                    }
                                >
                                    No generation
                                    requests yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

