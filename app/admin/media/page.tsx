import { requireSuperadmin } from "@/lib/require-superadmin";
import {
    createMedia,
    deleteMedia,
    updateMedia,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
    const { admin } =
        await requireSuperadmin();

    const [
        mediaResult,
        profilesResult,
    ] = await Promise.all([
        admin
            .from(
                "caption_generations"
            )
            .select(
                "id, user_id, image_path, prompt, caption, model, vibe, created_at"
            )
            .order("created_at", {
                ascending: false,
            }),

        admin
            .from("profiles")
            .select(
                "id, username"
            ),
    ]);

    const media =
        mediaResult.data ?? [];

    const profiles =
        profilesResult.data ?? [];

    const profileMap =
        new Map(
            profiles.map(
                (profile) => [
                    profile.id,
                    profile.username,
                ]
            )
        );

    return (
        <>
            <header className="admin-page-header">
                <div>
                    <p className="admin-kicker">
                        CONTENT
                    </p>

                    <h2>
                        AI Media
                    </h2>
                </div>
            </header>

            <section className="admin-card">
                <h3>
                    Create media
                </h3>

                <form
                    action={
                        createMedia
                    }
                    className="admin-form"
                >
                    <label>
                        Owner

                        <select
                            name="user_id"
                            required
                        >
                            <option value="">
                                Select user
                            </option>

                            {profiles.map(
                                (
                                    profile
                                ) => (
                                    <option
                                        key={
                                            profile.id
                                        }
                                        value={
                                            profile.id
                                        }
                                    >
                                        @
                                        {profile.username ??
                                            profile.id}
                                    </option>
                                )
                            )}
                        </select>
                    </label>

                    <label>
                        Image

                        <input
                            name="image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            required
                        />
                    </label>

                    <label>
                        Caption

                        <input
                            name="caption"
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
                        Model

                        <input
                            name="model"
                            defaultValue="gemini-admin"
                            required
                        />
                    </label>

                    <label>
                        Vibe

                        <input
                            name="vibe"
                            placeholder="Dry"
                        />
                    </label>

                    <button className="admin-button">
                        Create
                    </button>
                </form>
            </section>

            <div className="admin-media-list">
                {media.map(
                    (item) => {
                        const {
                            data: {
                                publicUrl,
                            },
                        } =
                            admin.storage
                                .from(
                                    "caption-images"
                                )
                                .getPublicUrl(
                                    item.image_path
                                );

                        return (
                            <section
                                key={
                                    item.id
                                }
                                className="admin-card media-admin-card"
                            >
                                <img
                                    src={
                                        publicUrl
                                    }
                                    alt=""
                                    className="admin-media-image"
                                />

                                <p className="muted">
                                    Owner: @
                                    {profileMap.get(
                                            item.user_id
                                        ) ??
                                        "unknown"}
                                </p>

                                <form
                                    action={
                                        updateMedia
                                    }
                                    className="admin-form"
                                >
                                    <input
                                        type="hidden"
                                        name="id"
                                        value={
                                            item.id
                                        }
                                    />

                                    <label>
                                        Caption

                                        <input
                                            name="caption"
                                            defaultValue={
                                                item.caption
                                            }
                                            required
                                        />
                                    </label>

                                    <label>
                                        Prompt

                                        <textarea
                                            name="prompt"
                                            defaultValue={
                                                item.prompt
                                            }
                                            required
                                        />
                                    </label>

                                    <label>
                                        Model

                                        <input
                                            name="model"
                                            defaultValue={
                                                item.model
                                            }
                                            required
                                        />
                                    </label>

                                    <label>
                                        Vibe

                                        <input
                                            name="vibe"
                                            defaultValue={
                                                item.vibe ??
                                                ""
                                            }
                                        />
                                    </label>

                                    <button className="admin-button">
                                        Save changes
                                    </button>
                                </form>

                                <form
                                    action={
                                        deleteMedia
                                    }
                                >
                                    <input
                                        type="hidden"
                                        name="id"
                                        value={
                                            item.id
                                        }
                                    />

                                    <button className="danger-button">
                                        Delete
                                    </button>
                                </form>
                            </section>
                        );
                    }
                )}
            </div>
        </>
    );
}