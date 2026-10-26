import { requireSuperadmin } from "@/lib/require-superadmin";

import {
    createImage,
    deleteImage,
    updateImage,
} from "./actions";

export const dynamic =
    "force-dynamic";


export default async function ImagesPage() {
    const { admin } =
        await requireSuperadmin();

    const [
        imagesResult,
        profilesResult,
    ] = await Promise.all([
        admin
            .from("images")
            .select(
                "id, user_id, storage_bucket, storage_path, original_filename, mime_type, size_bytes, alt_text, created_at"
            )
            .order(
                "created_at",
                {
                    ascending:
                        false,
                }
            ),

        admin
            .from("profiles")
            .select(
                "id, username"
            )
            .order(
                "username"
            ),
    ]);

    if (
        imagesResult.error
    ) {
        throw new Error(
            imagesResult.error.message
        );
    }

    if (
        profilesResult.error
    ) {
        throw new Error(
            profilesResult.error.message
        );
    }

    const images =
        imagesResult.data ?? [];

    const profiles =
        profilesResult.data ?? [];

    const profileById =
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
                <p className="admin-kicker">
                    CONFIGURATION
                </p>

                <h2>
                    Images
                </h2>

                <p className="admin-page-subtitle">
                    Upload, view, replace,
                    edit, and delete images
                    stored by Morningside
                    Caption Club.
                </p>
            </header>


            {/* CREATE */}

            <section className="admin-card">
                <div className="admin-section-heading">
                    <h3>
                        Upload New Image
                    </h3>

                    <p>
                        Upload a JPEG, PNG, or
                        WebP image into the
                        caption-images Storage
                        bucket.
                    </p>
                </div>

                <form
                    action={
                        createImage
                    }
                    className="admin-form"
                >
                    <label>
                        Image
                        <input
                            type="file"
                            name="image"
                            accept="image/jpeg,image/png,image/webp"
                            required
                        />
                    </label>

                    <label>
                        Owner
                        <select name="user_id">
                            <option value="">
                                No owner /
                                admin upload
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
                        Alt Text
                        <input
                            name="alt_text"
                            placeholder="Optional description of the image"
                        />
                    </label>

                    <button
                        type="submit"
                        className="admin-button"
                    >
                        Upload Image
                    </button>
                </form>
            </section>


            {/* READ + UPDATE + DELETE */}

            <div
                className="admin-image-grid"
                style={{
                    marginTop:
                        "22px",
                }}
            >
                {images.map(
                    (image) => {
                        const {
                            data: {
                                publicUrl,
                            },
                        } =
                            admin.storage
                                .from(
                                    image.storage_bucket
                                )
                                .getPublicUrl(
                                    image.storage_path
                                );

                        return (
                            <article
                                key={
                                    image.id
                                }
                                className="admin-image-card"
                            >
                                {/* READ: actual image */}

                                <img
                                    src={
                                        publicUrl
                                    }
                                    alt={
                                        image.alt_text ??
                                        image.original_filename ??
                                        "Admin image"
                                    }
                                    className="admin-image-preview"
                                />

                                <div className="admin-image-card-body">

                                    {/* READ metadata */}

                                    <div
                                        style={{
                                            marginBottom:
                                                "20px",
                                        }}
                                    >
                                        <h3
                                            style={{
                                                margin:
                                                    "0 0 8px",
                                            }}
                                        >
                                            {image.original_filename ??
                                                "Untitled image"}
                                        </h3>

                                        <p className="admin-record-meta">
                                            Owner:{" "}
                                            <strong>
                                                {image.user_id
                                                    ? `@${profileById.get(
                                                        image.user_id
                                                    ) ?? "unknown"}`
                                                    : "Admin / no owner"}
                                            </strong>
                                        </p>

                                        <p className="admin-record-meta">
                                            Type:{" "}
                                            <strong>
                                                {image.mime_type ??
                                                    "Unknown"}
                                            </strong>
                                        </p>

                                        <p className="admin-record-meta">
                                            Size:{" "}
                                            <strong>
                                                {image.size_bytes
                                                    ? `${Math.round(
                                                        image.size_bytes /
                                                        1024
                                                    )} KB`
                                                    : "Unknown"}
                                            </strong>
                                        </p>

                                        <p className="admin-record-meta">
                                            Uploaded:{" "}
                                            <strong>
                                                {new Date(
                                                    image.created_at
                                                ).toLocaleString()}
                                            </strong>
                                        </p>

                                        <p className="admin-record-meta">
                                            Storage path:
                                        </p>

                                        <div className="admin-code-block">
                                            {
                                                image.storage_path
                                            }
                                        </div>

                                        <p className="admin-record-meta">
                                            Alt text:{" "}
                                            <strong>
                                                {image.alt_text ||
                                                    "None"}
                                            </strong>
                                        </p>
                                    </div>


                                    {/* UPDATE */}

                                    <form
                                        action={
                                            updateImage
                                        }
                                        className="admin-form"
                                    >
                                        <input
                                            type="hidden"
                                            name="id"
                                            value={
                                                image.id
                                            }
                                        />

                                        <label>
                                            Filename Metadata
                                            <input
                                                name="original_filename"
                                                defaultValue={
                                                    image.original_filename ??
                                                    ""
                                                }
                                            />
                                        </label>

                                        <label>
                                            Alt Text
                                            <input
                                                name="alt_text"
                                                defaultValue={
                                                    image.alt_text ??
                                                    ""
                                                }
                                            />
                                        </label>

                                        <label>
                                            Owner
                                            <select
                                                name="user_id"
                                                defaultValue={
                                                    image.user_id ??
                                                    ""
                                                }
                                            >
                                                <option value="">
                                                    No owner /
                                                    admin upload
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
                                            Replace Image
                                            <input
                                                type="file"
                                                name="replacement_image"
                                                accept="image/jpeg,image/png,image/webp"
                                            />

                                            <span className="admin-record-meta">
                                                Optional. Leave blank
                                                to keep the current
                                                image file.
                                            </span>
                                        </label>

                                        <button
                                            type="submit"
                                            className="admin-button"
                                        >
                                            Save Changes
                                        </button>
                                    </form>


                                    {/* DELETE */}

                                    <form
                                        action={
                                            deleteImage
                                        }
                                    >
                                        <input
                                            type="hidden"
                                            name="id"
                                            value={
                                                image.id
                                            }
                                        />

                                        <button
                                            type="submit"
                                            className="danger-button"
                                        >
                                            Delete Image
                                        </button>
                                    </form>
                                </div>
                            </article>
                        );
                    }
                )}

                {images.length ===
                    0 && (
                        <section className="admin-card">
                            <p className="muted">
                                No images found.
                            </p>
                        </section>
                    )}
            </div>
        </>
    );
}

