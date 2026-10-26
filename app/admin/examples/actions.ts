"use server";

import { revalidatePath } from "next/cache";
import { requireSuperadmin } from "@/lib/require-superadmin";

export async function createExample(
    formData: FormData
) {
    const { admin } =
        await requireSuperadmin();

    const name =
        String(
            formData.get(
                "name"
            ) ?? ""
        ).trim();

    const prompt =
        String(
            formData.get(
                "prompt"
            ) ?? ""
        ).trim();

    const expectedOutput =
        String(
            formData.get(
                "expected_output"
            ) ?? ""
        ).trim();

    const notes =
        String(
            formData.get(
                "notes"
            ) ?? ""
        ).trim();

    if (
        !name ||
        !prompt ||
        !expectedOutput
    ) {
        throw new Error(
            "Name, prompt, and expected output are required."
        );
    }

    const { error } =
        await admin
            .from(
                "ai_generation_examples"
            )
            .insert({
                name,
                prompt,
                expected_output:
                expectedOutput,
                notes:
                    notes || null,
                is_active:
                    true,
            });

    if (error) {
        throw new Error(
            error.message
        );
    }

    revalidatePath(
        "/admin/examples"
    );
}


export async function updateExample(
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
            formData.get(
                "name"
            ) ?? ""
        ).trim();

    const prompt =
        String(
            formData.get(
                "prompt"
            ) ?? ""
        ).trim();

    const expectedOutput =
        String(
            formData.get(
                "expected_output"
            ) ?? ""
        ).trim();

    const notes =
        String(
            formData.get(
                "notes"
            ) ?? ""
        ).trim();

    const isActive =
        formData.get(
            "is_active"
        ) === "on";

    const { error } =
        await admin
            .from(
                "ai_generation_examples"
            )
            .update({
                name,
                prompt,
                expected_output:
                expectedOutput,
                notes:
                    notes || null,
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
        "/admin/examples"
    );
}


export async function deleteExample(
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
                "ai_generation_examples"
            )
            .delete()
            .eq("id", id);

    if (error) {
        throw new Error(
            error.message
        );
    }

    revalidatePath(
        "/admin/examples"
    );
}

