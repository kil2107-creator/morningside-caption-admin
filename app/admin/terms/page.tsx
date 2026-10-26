import { requireSuperadmin } from "@/lib/require-superadmin";

import {
    createTerm,
    deleteTerm,
    updateTerm,
} from "./actions";

export const dynamic =
    "force-dynamic";

export default async function TermsPage() {
    const { admin } =
        await requireSuperadmin();

    const {
        data: terms,
        error,
    } =
        await admin
            .from("terms")
            .select(
                "id, term, definition, is_active, created_at"
            )
            .order("term", {
                ascending: true,
            });

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
                    Terms
                </h2>

                <p className="admin-page-subtitle">
                    Maintain reusable terminology
                    and definitions for the AI
                    system.
                </p>
            </header>

            <section className="admin-card">
                <div className="admin-section-heading">
                    <h3>
                        Add Term
                    </h3>

                    <p>
                        Create a new term and
                        definition.
                    </p>
                </div>

                <form
                    action={createTerm}
                    className="admin-form"
                >
                    <label>
                        Term
                        <input
                            name="term"
                            placeholder="Morningside"
                            required
                        />
                    </label>

                    <label>
                        Definition
                        <textarea
                            name="definition"
                            placeholder="Area surrounding Columbia University's main campus..."
                            required
                        />
                    </label>

                    <button
                        type="submit"
                        className="admin-button"
                    >
                        Add Term
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
                {(terms ?? []).map(
                    (term) => (
                        <section
                            key={
                                term.id
                            }
                            className="admin-card"
                        >
                            <form
                                action={
                                    updateTerm
                                }
                                className="admin-form"
                            >
                                <input
                                    type="hidden"
                                    name="id"
                                    value={
                                        term.id
                                    }
                                />

                                <label>
                                    Term
                                    <input
                                        name="term"
                                        defaultValue={
                                            term.term
                                        }
                                        required
                                    />
                                </label>

                                <label>
                                    Definition
                                    <textarea
                                        name="definition"
                                        defaultValue={
                                            term.definition
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
                                            term.is_active
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
                                    Save Changes
                                </button>
                            </form>

                            <form
                                action={
                                    deleteTerm
                                }
                            >
                                <input
                                    type="hidden"
                                    name="id"
                                    value={
                                        term.id
                                    }
                                />

                                <button
                                    type="submit"
                                    className="danger-button"
                                >
                                    Delete Term
                                </button>
                            </form>
                        </section>
                    )
                )}

                {(terms ?? []).length ===
                    0 && (
                        <section className="admin-card">
                            <p className="muted">
                                No terms yet.
                            </p>
                        </section>
                    )}
            </div>
        </>
    );
}

