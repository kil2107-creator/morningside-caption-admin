"use server";

import { revalidatePath } from "next/cache";
import { requireSuperadmin } from "@/lib/require-superadmin";

export async function createModel(
    formData: FormData
) {
    const { admin } =
        await requireSuperadmin();

    const providerId =
        String(
            formData.get(
                "provider_id"
            ) ?? ""
        );

    const name =
        String(
            formData.get("name") ??
            ""
        ).trim();

    const modelKey =
        String(
            formData.get(
                "model_key"
            ) ?? ""
        ).trim();

    if (
        !providerId ||
        !name ||
        !modelKey
    ) {
        throw new Error(
            "Provider, name, and model key are required."
        );
    }

    const { error } =
        await admin
            .from("llm_models")
            .insert({
                provider_id:
                providerId,
                name,
                model_key:
                modelKey,
                is_active:
                    true,
            });

    if (error) {
        throw new Error(
            error.message
        );
    }

    revalidatePath(
        "/admin/models"
    );
}


export async function updateModel(
    formData: FormData
) {
    const { admin } =
        await requireSuperadmin();

    const id =
        String(
            formData.get("id") ??
            ""
        );

    const providerId =
        String(
            formData.get(
                "provider_id"
            ) ?? ""
        );

    const name =
        String(
            formData.get("name") ??
            ""
        ).trim();

    const modelKey =
        String(
            formData.get(
                "model_key"
            ) ?? ""
        ).trim();

    const isActive =
        formData.get(
            "is_active"
        ) === "on";

    const { error } =
        await admin
            .from("llm_models")
            .update({
                provider_id:
                providerId,
                name,
                model_key:
                modelKey,
                is_active:
                isActive,
            })
            .eq("id", id);

    if (error) {
        throw new Error(
            error.message
        );
    }

    revalidatePath(
        "/admin/models"
    );
}


export async function deleteModel(
    formData: FormData
) {
    const { admin } =
        await requireSuperadmin();

    const id =
        String(
            formData.get("id") ??
            ""
        );

    const { error } =
        await admin
            .from("llm_models")
            .delete()
            .eq("id", id);

    if (error) {
        throw new Error(
            error.message
        );
    }

    revalidatePath(
        "/admin/models"
    );
}

