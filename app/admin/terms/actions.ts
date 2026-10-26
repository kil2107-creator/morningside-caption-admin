"use server";

import { revalidatePath } from "next/cache";
import { requireSuperadmin } from "@/lib/require-superadmin";

export async function createTerm(
    formData: FormData
) {
    const { admin } =
        await requireSuperadmin();

    const term =
        String(
            formData.get(
                "term"
            ) ?? ""
        ).trim();

    const definition =
        String(
            formData.get(
                "definition"
            ) ?? ""
        ).trim();

    if (
        !term ||
        !definition
    ) {
        throw new Error(
            "Term and definition are required."
        );
    }

    const { error } =
        await admin
            .from("terms")
            .insert({
                term,
                definition,
                is_active:
                    true,
            });

    if (error) {
        throw new Error(
            error.message
        );
    }

    revalidatePath(
        "/admin/terms"
    );
}


export async function updateTerm(
    formData: FormData
) {
    const { admin } =
        await requireSuperadmin();

    const id =
        String(
            formData.get(
                "id"
            ) ?? ""
        );

    const term =
        String(
            formData.get(
                "term"
            ) ?? ""
        ).trim();

    const definition =
        String(
            formData.get(
                "definition"
            ) ?? ""
        ).trim();

    const isActive =
        formData.get(
            "is_active"
        ) === "on";

    if (
        !id ||
        !term ||
        !definition
    ) {
        throw new Error(
            "Term information is incomplete."
        );
    }

    const { error } =
        await admin
            .from("terms")
            .update({
                term,
                definition,
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
        "/admin/terms"
    );
}


export async function deleteTerm(
    formData: FormData
) {
    const { admin } =
        await requireSuperadmin();

    const id =
        String(
            formData.get(
                "id"
            ) ?? ""
        );

    if (!id) {
        throw new Error(
            "Term ID is required."
        );
    }

    const { error } =
        await admin
            .from("terms")
            .delete()
            .eq("id", id);

    if (error) {
        throw new Error(
            error.message
        );
    }

    revalidatePath(
        "/admin/terms"
    );
}

