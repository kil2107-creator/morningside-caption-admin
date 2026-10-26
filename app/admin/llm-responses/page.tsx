import { requireSuperadmin } from "@/lib/require-superadmin";

export const dynamic =
    "force-dynamic";

export default async function LLMResponsesPage() {
    const { admin } =
        await requireSuperadmin();

    const [
        responsesResult,
        modelsResult,
        requestsResult,
    ] = await Promise.all([
        admin
            .from(
                "llm_responses"
            )
            .select(
                "id, generation_request_id, llm_model_id, response_text, latency_ms, success, error_message, created_at"
            )
            .order(
                "created_at",
                {
                    ascending:
                        false,
                }
            )
            .limit(100),

        admin
            .from("llm_models")
            .select(
                "id, name"
            ),

        admin
            .from(
                "generation_requests"
            )
            .select(
                "id, user_prompt, vibe"
            ),
    ]);

    if (
        responsesResult.error
    ) {
        throw new Error(
            responsesResult.error.message
        );
    }

    const modelById =
        new Map(
            (
                modelsResult.data ??
                []
            ).map(
                (model) => [
                    model.id,
                    model.name,
                ]
            )
        );

    const requestById =
        new Map(
            (
                requestsResult.data ??
                []
            ).map(
                (request) => [
                    request.id,
                    request,
                ]
            )
        );

    const responses =
        responsesResult.data ?? [];

    return (
        <>
            <header className="admin-page-header">
                <p className="admin-kicker">
                    OBSERVABILITY
                </p>

                <h2>
                    LLM Responses
                </h2>

                <p className="admin-page-subtitle">
                    Inspect individual model calls,
                    outputs, errors, and response
                    latency.
                </p>
            </header>

            <div className="table-wrap">
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>
                            Request
                        </th>
                        <th>Model</th>
                        <th>
                            Response
                        </th>
                        <th>
                            Result
                        </th>
                        <th>
                            Latency
                        </th>
                        <th>Date</th>
                    </tr>
                    </thead>

                    <tbody>
                    {responses.map(
                        (
                            response
                        ) => {
                            const request =
                                requestById.get(
                                    response.generation_request_id
                                );

                            return (
                                <tr
                                    key={
                                        response.id
                                    }
                                >
                                    <td
                                        style={{
                                            maxWidth:
                                                "220px",
                                        }}
                                    >
                                        <strong>
                                            {request?.vibe ??
                                                "—"}
                                        </strong>

                                        <p
                                            style={{
                                                margin:
                                                    "5px 0 0",
                                                fontSize:
                                                    "12px",
                                            }}
                                        >
                                            {request?.user_prompt ??
                                                "Unknown request"}
                                        </p>
                                    </td>

                                    <td>
                                        {response.llm_model_id
                                            ? modelById.get(
                                                response.llm_model_id
                                            ) ??
                                            "Unknown model"
                                            : "Unknown model"}
                                    </td>

                                    <td
                                        style={{
                                            maxWidth:
                                                "380px",
                                        }}
                                    >
                                        {response.response_text ? (
                                            <details>
                                                <summary>
                                                    View
                                                    response
                                                </summary>

                                                <p className="admin-record-text">
                                                    {
                                                        response.response_text
                                                    }
                                                </p>
                                            </details>
                                        ) : (
                                            response.error_message ??
                                            "—"
                                        )}
                                    </td>

                                    <td>
                                            <span
                                                className={
                                                    response.success
                                                        ? "status-pill status-success"
                                                        : "status-pill status-failed"
                                                }
                                            >
                                                {response.success
                                                    ? "Success"
                                                    : "Failed"}
                                            </span>
                                    </td>

                                    <td>
                                        {response.latency_ms !==
                                        null
                                            ? `${response.latency_ms} ms`
                                            : "—"}
                                    </td>

                                    <td>
                                        {new Date(
                                            response.created_at
                                        ).toLocaleString()}
                                    </td>
                                </tr>
                            );
                        }
                    )}

                    {responses.length ===
                        0 && (
                            <tr>
                                <td
                                    colSpan={
                                        6
                                    }
                                >
                                    No LLM
                                    responses
                                    logged yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

