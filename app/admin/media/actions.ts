"use server";

import { revalidatePath } from "next/cache";
import { requireSuperadmin } from "@/lib/require-superadmin";

function getString(
    formData: FormData,
    key: string
) {
    const value =
        formData.get(key);

    return typeof value === "string"
        ? value.trim()
        : "";
}

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

export async function createMedia(
    formData: FormData
) {
    const { admin } =
        await requireSuperadmin();

    const userId =
        getString(
            formData,
            "user_id"
        );

    const caption =
        getString(
            formData,
            "caption"
        );

    const prompt =
        getString(
            formData,
            "prompt"
        );

    const model =
        getString(
            formData,
            "model"
        );

    const vibe =
        getString(
            formData,
            "vibe"
        );

    const image =
        formData.get("image");

    if (
        !userId ||
        !caption ||
        !prompt ||
        !model ||
        !(image instanceof File) ||
        image.size === 0
    ) {
        throw new Error(
            "Missing required media fields."
        );
    }

    const extension =
        getExtension(image.type);

    const imagePath =
        `${userId}/${crypto.randomUUID()}.${extension}`;

    const imageBuffer =
        Buffer.from(
            await image.arrayBuffer()
        );

    const { error: uploadError } =
        await admin.storage
            .from("caption-images")
            .upload(
                imagePath,
                imageBuffer,
                {
                    contentType:
                    image.type,
                    upsert: false,
                }
            );

    if (uploadError) {
        throw new Error(
            uploadError.message
        );
    }

    const { error: insertError } =
        await admin
            .from(
                "caption_generations"
            )
            .insert({
                user_id: userId,
                image_path:
                imagePath,
                prompt,
                caption,
                model,
                vibe:
                    vibe || null,
            });

    if (insertError) {
        await admin.storage
            .from("caption-images")
            .remove([
                imagePath,
            ]);

        throw new Error(
            insertError.message
        );
    }

    revalidatePath(
        "/admin/media"
    );
    revalidatePath("/admin");
}

export async function updateMedia(
    formData: FormData
) {
    const { admin } =
        await requireSuperadmin();

    const id =
        getString(
            formData,
            "id"
        );

    const caption =
        getString(
            formData,
            "caption"
        );

    const prompt =
        getString(
            formData,
            "prompt"
        );

    const model =
        getString(
            formData,
            "model"
        );

    const vibe =
        getString(
            formData,
            "vibe"
        );

    if (
        !id ||
        !caption ||
        !prompt ||
        !model
    ) {
        throw new Error(
            "Missing required update fields."
        );
    }

    const { error } =
        await admin
            .from(
                "caption_generations"
            )
            .update({
                caption,
                prompt,
                model,
                vibe:
                    vibe || null,
            })
            .eq("id", id);

    if (error) {
        throw new Error(
            error.message
        );
    }

    revalidatePath(
        "/admin/media"
    );
    revalidatePath("/admin");
}

export async function deleteMedia(
    formData: FormData
) {
    const { admin } =
        await requireSuperadmin();

    const id =
        getString(
            formData,
            "id"
        );

    if (!id) {
        return;
    }

    const {
        data: generation,
    } = await admin
        .from(
            "caption_generations"
        )
        .select("image_path")
        .eq("id", id)
        .maybeSingle();

    const { error } =
        await admin
            .from(
                "caption_generations"
            )
            .delete()
            .eq("id", id);

    if (error) {
        throw new Error(
            error.message
        );
    }

    if (
        generation?.image_path
    ) {
        await admin.storage
            .from("caption-images")
            .remove([
                generation.image_path,
            ]);
    }

    revalidatePath(
        "/admin/media"
    );
    revalidatePath("/admin");
}

