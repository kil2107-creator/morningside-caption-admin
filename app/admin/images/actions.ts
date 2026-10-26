"use server";

import { revalidatePath } from "next/cache";
import { requireSuperadmin } from "@/lib/require-superadmin";

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const MAX_IMAGE_SIZE =
    5 * 1024 * 1024;

function getExtension(
    mimeType: string
) {
    if (mimeType === "image/png") {
        return "png";
    }

    if (mimeType === "image/webp") {
        return "webp";
    }

    return "jpg";
}


/*
 * CREATE
 *
 * Upload a brand-new image to Supabase Storage
 * and create its metadata row.
 */
export async function createImage(
    formData: FormData
) {
    const { admin } =
        await requireSuperadmin();

    const file =
        formData.get("image");

    const userId =
        String(
            formData.get(
                "user_id"
            ) ?? ""
        ).trim();

    const altText =
        String(
            formData.get(
                "alt_text"
            ) ?? ""
        ).trim();

    if (
        !(file instanceof File)
    ) {
        throw new Error(
            "Choose an image."
        );
    }

    if (
        !ALLOWED_IMAGE_TYPES.includes(
            file.type
        )
    ) {
        throw new Error(
            "Image must be JPEG, PNG, or WebP."
        );
    }

    if (
        file.size >
        MAX_IMAGE_SIZE
    ) {
        throw new Error(
            "Image must be smaller than 5 MB."
        );
    }

    const extension =
        getExtension(
            file.type
        );

    const folder =
        userId || "admin";

    const path =
        `${folder}/${crypto.randomUUID()}.${extension}`;

    const buffer =
        Buffer.from(
            await file.arrayBuffer()
        );

    const {
        error: uploadError,
    } =
        await admin.storage
            .from(
                "caption-images"
            )
            .upload(
                path,
                buffer,
                {
                    contentType:
                    file.type,

                    upsert:
                        false,
                }
            );

    if (uploadError) {
        throw new Error(
            uploadError.message
        );
    }

    const {
        error: databaseError,
    } =
        await admin
            .from("images")
            .insert({
                user_id:
                    userId ||
                    null,

                storage_bucket:
                    "caption-images",

                storage_path:
                path,

                original_filename:
                file.name,

                mime_type:
                file.type,

                size_bytes:
                file.size,

                alt_text:
                    altText ||
                    null,
            });

    /*
     * If the metadata insert fails,
     * remove the uploaded Storage file.
     */
    if (databaseError) {
        await admin.storage
            .from(
                "caption-images"
            )
            .remove([
                path,
            ]);

        throw new Error(
            databaseError.message
        );
    }

    revalidatePath(
        "/admin/images"
    );
}


/*
 * UPDATE
 *
 * Update image metadata and optionally replace
 * the actual Storage file.
 */
export async function updateImage(
    formData: FormData
) {
    const { admin } =
        await requireSuperadmin();

    const id =
        String(
            formData.get("id") ??
            ""
        );

    const originalFilename =
        String(
            formData.get(
                "original_filename"
            ) ?? ""
        ).trim();

    const altText =
        String(
            formData.get(
                "alt_text"
            ) ?? ""
        ).trim();

    const userId =
        String(
            formData.get(
                "user_id"
            ) ?? ""
        ).trim();

    const replacementFile =
        formData.get(
            "replacement_image"
        );

    if (!id) {
        throw new Error(
            "Image ID is missing."
        );
    }


    /*
     * Get the current Storage information before
     * potentially replacing the file.
     */
    const {
        data: currentImage,
        error: currentImageError,
    } =
        await admin
            .from("images")
            .select(
                "id, storage_bucket, storage_path, mime_type, size_bytes"
            )
            .eq("id", id)
            .single();

    if (
        currentImageError ||
        !currentImage
    ) {
        throw new Error(
            "Image could not be found."
        );
    }


    /*
     * If no replacement file was selected,
     * just update metadata.
     */
    if (
        !(
            replacementFile instanceof
            File
        ) ||
        replacementFile.size === 0
    ) {
        const { error } =
            await admin
                .from("images")
                .update({
                    original_filename:
                        originalFilename ||
                        null,

                    alt_text:
                        altText ||
                        null,

                    user_id:
                        userId ||
                        null,
                })
                .eq(
                    "id",
                    id
                );

        if (error) {
            throw new Error(
                error.message
            );
        }

        revalidatePath(
            "/admin/images"
        );

        return;
    }


    /*
     * Validate replacement file.
     */
    if (
        !ALLOWED_IMAGE_TYPES.includes(
            replacementFile.type
        )
    ) {
        throw new Error(
            "Replacement image must be JPEG, PNG, or WebP."
        );
    }

    if (
        replacementFile.size >
        MAX_IMAGE_SIZE
    ) {
        throw new Error(
            "Replacement image must be smaller than 5 MB."
        );
    }


    /*
     * Upload replacement under a new unique path.
     */
    const extension =
        getExtension(
            replacementFile.type
        );

    const folder =
        userId || "admin";

    const newPath =
        `${folder}/${crypto.randomUUID()}.${extension}`;

    const replacementBuffer =
        Buffer.from(
            await replacementFile.arrayBuffer()
        );

    const {
        error: replacementUploadError,
    } =
        await admin.storage
            .from(
                currentImage.storage_bucket
            )
            .upload(
                newPath,
                replacementBuffer,
                {
                    contentType:
                    replacementFile.type,

                    upsert:
                        false,
                }
            );

    if (
        replacementUploadError
    ) {
        throw new Error(
            replacementUploadError.message
        );
    }


    /*
     * Update the existing images row so its ID
     * stays the same. That means foreign-key
     * relationships remain intact.
     */
    const {
        error: updateError,
    } =
        await admin
            .from("images")
            .update({
                storage_path:
                newPath,

                original_filename:
                    originalFilename ||
                    replacementFile.name,

                mime_type:
                replacementFile.type,

                size_bytes:
                replacementFile.size,

                alt_text:
                    altText ||
                    null,

                user_id:
                    userId ||
                    null,
            })
            .eq(
                "id",
                id
            );


    /*
     * If the database update fails,
     * remove the newly uploaded replacement.
     */
    if (updateError) {
        await admin.storage
            .from(
                currentImage.storage_bucket
            )
            .remove([
                newPath,
            ]);

        throw new Error(
            updateError.message
        );
    }


    /*
     * Database update succeeded.
     * Remove the old Storage object.
     */
    const {
        error: oldFileDeleteError,
    } =
        await admin.storage
            .from(
                currentImage.storage_bucket
            )
            .remove([
                currentImage.storage_path,
            ]);

    if (
        oldFileDeleteError
    ) {
        console.warn(
            "Image was replaced, but old Storage file cleanup failed:",
            oldFileDeleteError
        );
    }

    revalidatePath(
        "/admin/images"
    );
}


/*
 * DELETE
 *
 * Remove both the database image record and
 * the actual Storage object.
 */
export async function deleteImage(
    formData: FormData
) {
    const { admin } =
        await requireSuperadmin();

    const id =
        String(
            formData.get("id") ??
            ""
        );

    if (!id) {
        throw new Error(
            "Image ID is missing."
        );
    }

    const {
        data: image,
        error: imageError,
    } =
        await admin
            .from("images")
            .select(
                "id, storage_bucket, storage_path"
            )
            .eq(
                "id",
                id
            )
            .single();

    if (
        imageError ||
        !image
    ) {
        throw new Error(
            "Image could not be found."
        );
    }


    /*
     * Protect published captions from broken images.
     *
     * If this image is attached to AI Media,
     * delete that media record first.
     */
    const {
        data: linkedCaptions,
        error: linkedError,
    } =
        await admin
            .from(
                "caption_generations"
            )
            .select("id")
            .eq(
                "image_id",
                id
            )
            .limit(1);

    if (linkedError) {
        throw new Error(
            linkedError.message
        );
    }

    if (
        linkedCaptions &&
        linkedCaptions.length >
        0
    ) {
        throw new Error(
            "This image is currently used by a posted caption. Delete that AI Media record first."
        );
    }


    /*
     * Delete database record.
     *
     * generation_requests.image_id is configured
     * with ON DELETE SET NULL.
     */
    const {
        error: deleteError,
    } =
        await admin
            .from("images")
            .delete()
            .eq(
                "id",
                id
            );

    if (deleteError) {
        throw new Error(
            deleteError.message
        );
    }


    /*
     * Delete the actual Storage object.
     */
    const {
        error: storageError,
    } =
        await admin.storage
            .from(
                image.storage_bucket
            )
            .remove([
                image.storage_path,
            ]);

    if (storageError) {
        console.warn(
            "Image database row was deleted, but Storage cleanup failed:",
            storageError
        );
    }

    revalidatePath(
        "/admin/images"
    );
}

