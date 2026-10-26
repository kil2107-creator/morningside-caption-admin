import { requireSuperadmin } from "@/lib/require-superadmin";
import { updatePromptMix } from "./actions";

export const dynamic =
    "force-dynamic";

export default async function PromptMixPage() {
    const { admin } =
        await requireSuperadmin();

    const [
        mixResult,
        chainsResult,
    ] = await Promise.all([
        admin
            .from(
                "prompt_chain_mix"
            )
            .select(
                "prompt_chain_id, weight, is_active, updated_at"
            ),

        admin
            .from(
                "prompt_chains"
            )
            .select(
                "id, name, description"
            ),
    ]);

    if (mixResult.error) {
        throw new Error(
            mixResult.error.message
        );
    }

    if (chainsResult.error) {
        throw new Error(
            chainsResult.error.message
        );
    }

    const mix =
        mixResult.data ?? [];

    const chains =
        chainsResult.data ?? [];

    const chainById =
        new Map(
            chains.map(
                (chain) => [
                    chain.id,
                    chain,
                ]
            )
        );

    return (
        <>
            <header className="admin-page-header">
                <p className="admin-kicker">
                    OBSERVABILITY
                </p>

                <h2>
                    Prompt Mix
                </h2>

                <p className="admin-page-subtitle">
                    Control which prompt chains
                    participate in caption generation
                    and their relative selection
                    weights.
                </p>
            </header>

            <div className="admin-stack">
                {mix.map(
                    (row) => {
                        const chain =
                            chainById.get(
                                row.prompt_chain_id
                            );

                        return (
                            <section
                                key={
                                    row.prompt_chain_id
                                }
                                className="admin-card"
                            >
                                <div className="admin-section-heading">
                                    <h3>
                                        {chain?.name ??
                                            "Unknown Prompt Chain"}
                                    </h3>

                                    <p>
                                        {chain?.description ??
                                            "No description."}
                                    </p>
                                </div>

                                <form
                                    action={
                                        updatePromptMix
                                    }
                                    className="admin-form"
                                >
                                    <input
                                        type="hidden"
                                        name="prompt_chain_id"
                                        value={
                                            row.prompt_chain_id
                                        }
                                    />

                                    <label>
                                        Weight
                                        <input
                                            type="number"
                                            name="weight"
                                            min="0"
                                            max="100"
                                            step="1"
                                            defaultValue={
                                                row.weight
                                            }
                                            required
                                        />
                                    </label>

                                    <label
                                        style={{
                                            display:
                                                "flex",
                                            gridTemplateColumns:
                                                "auto 1fr",
                                            alignItems:
                                                "center",
                                            width:
                                                "fit-content",
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            defaultChecked={
                                                row.is_active
                                            }
                                            style={{
                                                width:
                                                    "auto",
                                            }}
                                        />

                                        Active
                                    </label>

                                    <button
                                        type="submit"
                                        className="admin-button"
                                    >
                                        Save
                                    </button>
                                </form>
                            </section>
                        );
                    }
                )}

                {mix.length === 0 && (
                    <section className="admin-card">
                        <p className="muted">
                            No prompt mix
                            entries found.
                        </p>
                    </section>
                )}
            </div>
        </>
    );
}
