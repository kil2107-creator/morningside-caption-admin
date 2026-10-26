import { requireSuperadmin } from "@/lib/require-superadmin";

import {
    createExample,
    deleteExample,
    updateExample,
} from "./actions";

export const dynamic =
    "force-dynamic";

export default async function ExamplesPage() {
    const { admin } =
        await requireSuperadmin();

    const {
        data: examples,
        error,
    } =
        await admin
            .from(
                "ai_generation_examples"
            )
            .select(
                "id, name, prompt, expected_output, notes, is_active"
            )
            .order(
                "created_at",
                {
                    ascending:
                        false,
                }
            );

    if (error) {
        throw new Error(
            error.message
        );
    }

    return (
        <>
            <header className="admin-page-header">
                <p className="admin-kicker">
                    CONFIGURATION
                </p>

                <h2>
                    AI Generation Examples
                </h2>

                <p className="admin-page-subtitle">
                    Maintain examples that can be
                    used to evaluate desired caption
                    behavior.
                </p>
            </header>

            <section className="admin-card">
                <h3>
                    Add Example
                </h3>

                <form
                    action={
                        createExample
                    }
                    className="admin-form"
                >
                    <label>
                        Name
                        <input
                            name="name"
                            placeholder="1 Train Delay"
                            required
                        />
                    </label>

                    <label>
                        Prompt
                        <textarea
                            name="prompt"
                            required
                        />
                    </label>

                    <label>
                        Expected Output
                        <textarea
                            name="expected_output"
                            required
                        />
                    </label>

                    <label>
                        Notes
                        <textarea
                            name="notes"
                        />
                    </label>

                    <button className="admin-button">
                        Add Example
                    </button>
                </form>
            </section>

            <div
                className="admin-stack"
                style={{
                    marginTop:
                        "22px",
                }}
            >
                {(examples ?? []).map(
                    (example) => (
                        <section
                            key={
                                example.id
                            }
                            className="admin-card"
                        >
                            <form
                                action={
                                    updateExample
                                }
                                className="admin-form"
                            >
                                <input
                                    type="hidden"
                                    name="id"
                                    value={
                                        example.id
                                    }
                                />

                                <label>
                                    Name
                                    <input
                                        name="name"
                                        defaultValue={
                                            example.name
                                        }
                                        required
                                    />
                                </label>

                                <label>
                                    Prompt
                                    <textarea
                                        name="prompt"
                                        defaultValue={
                                            example.prompt
                                        }
                                        required
                                    />
                                </label>

                                <label>
                                    Expected Output
                                    <textarea
                                        name="expected_output"
                                        defaultValue={
                                            example.expected_output
                                        }
                                        required
                                    />
                                </label>

                                <label>
                                    Notes
                                    <textarea
                                        name="notes"
                                        defaultValue={
                                            example.notes ??
                                            ""
                                        }
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
                                            example.is_active
                                        }
                                        style={{
                                            width:
                                                "auto",
                                        }}
                                    />
                                    Active
                                </label>

                                <button className="admin-button">
                                    Save Changes
                                </button>
                            </form>

                            <form
                                action={
                                    deleteExample
                                }
                            >
                                <input
                                    type="hidden"
                                    name="id"
                                    value={
                                        example.id
                                    }
                                />

                                <button className="danger-button">
                                    Delete Example
                                </button>
                            </form>
                        </section>
                    )
                )}
            </div>
        </>
    );
}

