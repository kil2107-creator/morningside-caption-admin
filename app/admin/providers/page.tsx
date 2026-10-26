import { requireSuperadmin } from "@/lib/require-superadmin";

import {
    createProvider,
    deleteProvider,
    updateProvider,
} from "./actions";

export const dynamic =
    "force-dynamic";

export default async function ProvidersPage() {
    const { admin } =
        await requireSuperadmin();

    const {
        data: providers,
        error,
    } =
        await admin
            .from(
                "llm_providers"
            )
            .select(
                "id, name, slug, base_url, is_active"
            )
            .order("name");

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
                    LLM Providers
                </h2>

                <p className="admin-page-subtitle">
                    Manage companies or services
                    that provide language models.
                </p>
            </header>

            <section className="admin-card">
                <h3>
                    Add Provider
                </h3>

                <form
                    action={
                        createProvider
                    }
                    className="admin-form"
                >
                    <label>
                        Name
                        <input
                            name="name"
                            placeholder="Google"
                            required
                        />
                    </label>

                    <label>
                        Slug
                        <input
                            name="slug"
                            placeholder="google"
                            required
                        />
                    </label>

                    <label>
                        Base URL
                        <input
                            name="base_url"
                            placeholder="Optional"
                        />
                    </label>

                    <button className="admin-button">
                        Add Provider
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
                {(providers ?? []).map(
                    (provider) => (
                        <section
                            key={
                                provider.id
                            }
                            className="admin-card"
                        >
                            <form
                                action={
                                    updateProvider
                                }
                                className="admin-form"
                            >
                                <input
                                    type="hidden"
                                    name="id"
                                    value={
                                        provider.id
                                    }
                                />

                                <label>
                                    Name
                                    <input
                                        name="name"
                                        defaultValue={
                                            provider.name
                                        }
                                        required
                                    />
                                </label>

                                <label>
                                    Slug
                                    <input
                                        name="slug"
                                        defaultValue={
                                            provider.slug
                                        }
                                        required
                                    />
                                </label>

                                <label>
                                    Base URL
                                    <input
                                        name="base_url"
                                        defaultValue={
                                            provider.base_url ??
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
                                        width:
                                            "fit-content",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        defaultChecked={
                                            provider.is_active
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
                                    deleteProvider
                                }
                            >
                                <input
                                    type="hidden"
                                    name="id"
                                    value={
                                        provider.id
                                    }
                                />

                                <button className="danger-button">
                                    Delete Provider
                                </button>
                            </form>
                        </section>
                    )
                )}
            </div>
        </>
    );
}

