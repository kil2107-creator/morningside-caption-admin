import { requireSuperadmin } from "@/lib/require-superadmin";

export const dynamic =
    "force-dynamic";

export default async function PromptChainsPage() {
    const { admin } =
        await requireSuperadmin();

    const [
        chainsResult,
        stepsResult,
    ] = await Promise.all([
        admin
            .from("prompt_chains")
            .select(
                "id, name, slug, description, is_active, created_at"
            )
            .order("created_at", {
                ascending: true,
            }),

        admin
            .from(
                "prompt_chain_steps"
            )
            .select(
                "id, prompt_chain_id, step_order, name, prompt_text"
            )
            .order("step_order", {
                ascending: true,
            }),
    ]);

    if (chainsResult.error) {
        throw new Error(
            chainsResult.error.message
        );
    }

    if (stepsResult.error) {
        throw new Error(
            stepsResult.error.message
        );
    }

    const chains =
        chainsResult.data ?? [];

    const steps =
        stepsResult.data ?? [];

    return (
        <>
            <header className="admin-page-header">
                <p className="admin-kicker">
                    OBSERVABILITY
                </p>

                <h2>
                    Prompt Chains
                </h2>

                <p className="admin-page-subtitle">
                    View the prompt structures and
                    ordered steps used to construct
                    AI caption requests.
                </p>
            </header>

            <div className="admin-stack">
                {chains.length === 0 ? (
                    <section className="admin-card">
                        <p className="muted">
                            No prompt chains found.
                        </p>
                    </section>
                ) : (
                    chains.map(
                        (chain) => {
                            const chainSteps =
                                steps.filter(
                                    (
                                        step
                                    ) =>
                                        step.prompt_chain_id ===
                                        chain.id
                                );

                            return (
                                <section
                                    key={
                                        chain.id
                                    }
                                    className="admin-card"
                                >
                                    <div className="admin-section-heading">
                                        <h3>
                                            {
                                                chain.name
                                            }
                                        </h3>

                                        <p>
                                            {
                                                chain.description ??
                                                "No description."
                                            }
                                        </p>
                                    </div>

                                    <span
                                        className={
                                            chain.is_active
                                                ? "status-pill status-success"
                                                : "status-pill status-neutral"
                                        }
                                    >
                                        {chain.is_active
                                            ? "Active"
                                            : "Inactive"}
                                    </span>

                                    <p className="admin-record-meta">
                                        Slug:{" "}
                                        <strong>
                                            {
                                                chain.slug
                                            }
                                        </strong>
                                    </p>

                                    <div
                                        className="admin-stack"
                                        style={{
                                            marginTop:
                                                "22px",
                                        }}
                                    >
                                        {chainSteps.map(
                                            (
                                                step
                                            ) => (
                                                <div
                                                    key={
                                                        step.id
                                                    }
                                                    className="admin-record-card"
                                                >
                                                    <p className="admin-kicker">
                                                        STEP{" "}
                                                        {
                                                            step.step_order
                                                        }
                                                    </p>

                                                    <h4>
                                                        {
                                                            step.name
                                                        }
                                                    </h4>

                                                    <div className="admin-code-block">
                                                        {
                                                            step.prompt_text
                                                        }
                                                    </div>
                                                </div>
                                            )
                                        )}

                                        {chainSteps.length ===
                                            0 && (
                                                <p className="muted">
                                                    No
                                                    steps
                                                    found.
                                                </p>
                                            )}
                                    </div>
                                </section>
                            );
                        }
                    )
                )}
            </div>
        </>
    );
}

