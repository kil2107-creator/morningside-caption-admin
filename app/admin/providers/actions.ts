"use server";

import { revalidatePath } from "next/cache";
import { requireSuperadmin } from "@/lib/require-superadmin";

export async function createProvider(
    formData: FormData
) {
    const { admin } =
        await requireSuperadmin();

    const name =
        String(
            formData.get("name") ??
            ""
        ).trim();

    const slug =
        String(
            formData.get("slug") ??
            ""
        )
            .trim()
            .toLowerCase();

    const baseUrl =
        String(
            formData.get(
                "base_url"
            ) ?? ""
        ).trim();

    if (
        !name ||
        !/^[a-z0-9-]+$/.test(
            slug
        )
    ) {
        throw new Error(
            "Provider name and a valid lowercase slug are required."
        );
    }

    const { error } =
        await admin
            .from(
                "llm_providers"
            )
            .insert({
                name,
                slug,
                base_url:
                    baseUrl || null,
                is_active:
                    true,
            });

    if (error) {
        throw new Error(
            error.message
        );
    }

    revalidatePath(
        "/admin/providers"
    );
}


export async function updateProvider(
    formData: FormData
) {
    const { admin } =
        await requireSuperadmin();

    const id =
        String(
            formData.get("id") ??
            ""
        );

    const name =
        String(
            formData.get("name") ??
            ""
        ).trim();

    const slug =
        String(
            formData.get("slug") ??
            ""
        )
            .trim()
            .toLowerCase();

    const baseUrl =
        String(
            formData.get(
                "base_url"
            ) ?? ""
        ).trim();

    const isActive =
        formData.get(
            "is_active"
        ) === "on";

    const { error } =
        await admin
            .from(
                "llm_providers"
            )
            .update({
                name,
                slug,
                base_url:
                    baseUrl || null,
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
        "/admin/providers"
    );
}


export async function deleteProvider(
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
            .from(
                "llm_providers"
            )
            .delete()
            .eq("id", id);

    if (error) {
        throw new Error(
            "This provider may still be used by an LLM model. Delete or reassign its models first."
        );
    }

    revalidatePath(
        "/admin/providers"
    );
}

