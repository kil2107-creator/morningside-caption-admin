import { requireSuperadmin } from "@/lib/require-superadmin";

import {
    createModel,
    deleteModel,
    updateModel,
} from "./actions";

export const dynamic =
    "force-dynamic";

export default async function ModelsPage() {
    const { admin } =
        await requireSuperadmin();

    const [
        modelsResult,
        providersResult,
    ] = await Promise.all([
        admin
            .from("llm_models")
            .select(
                "id, provider_id, name, model_key, is_active"
            )
            .order("name"),

        admin
            .from(
                "llm_providers"
            )
            .select(
                "id, name"
            )
            .order("name"),
    ]);

    if (modelsResult.error) {
        throw new Error(
            modelsResult.error.message
        );
    }

    const models =
        modelsResult.data ?? [];

    const providers =
        providersResult.data ?? [];

    return (
        <>
            <header className="admin-page-header">
                <p className="admin-kicker">
                    CONFIGURATION
                </p>

                <h2>
                    LLM Models
                </h2>

                <p className="admin-page-subtitle">
                    Manage the language models
                    available to the application.
                </p>
            </header>

            <section className="admin-card">
                <h3>
                    Add Model
                </h3>

                <form
                    action={createModel}
                    className="admin-form"
                >
                    <label>
                        Provider
                        <select
                            name="provider_id"
                            required
                        >
                            <option value="">
                                Select provider
                            </option>

                            {providers.map(
                                (
                                    provider
                                ) => (
                                    <option
                                        key={
                                            provider.id
                                        }
                                        value={
                                            provider.id
                                        }
                                    >
                                        {
                                            provider.name
                                        }
                                    </option>
                                )
                            )}
                        </select>
                    </label>

                    <label>
                        Display Name
                        <input
                            name="name"
                            required
                        />
                    </label>

                    <label>
                        Model Key
                        <input
                            name="model_key"
                            placeholder="gemini-3.8-flash"
                            required
                        />
                    </label>

                    <button className="admin-button">
                        Add Model
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
                {models.map(
                    (model) => (
                        <section
                            key={
                                model.id
                            }
                            className="admin-card"
                        >
                            <form
                                action={
                                    updateModel
                                }
                                className="admin-form"
                            >
                                <input
                                    type="hidden"
                                    name="id"
                                    value={
                                        model.id
                                    }
                                />

                                <label>
                                    Provider
                                    <select
                                        name="provider_id"
                                        defaultValue={
                                            model.provider_id
                                        }
                                        required
                                    >
                                        {providers.map(
                                            (
                                                provider
                                            ) => (
                                                <option
                                                    key={
                                                        provider.id
                                                    }
                                                    value={
                                                        provider.id
                                                    }
                                                >
                                                    {
                                                        provider.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </label>

                                <label>
                                    Name
                                    <input
                                        name="name"
                                        defaultValue={
                                            model.name
                                        }
                                        required
                                    />
                                </label>

                                <label>
                                    Model Key
                                    <input
                                        name="model_key"
                                        defaultValue={
                                            model.model_key
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
                                        width:
                                            "fit-content",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        defaultChecked={
                                            model.is_active
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
                                    deleteModel
                                }
                            >
                                <input
                                    type="hidden"
                                    name="id"
                                    value={
                                        model.id
                                    }
                                />

                                <button className="danger-button">
                                    Delete Model
                                </button>
                            </form>
                        </section>
                    )
                )}
            </div>
        </>
    );
}

