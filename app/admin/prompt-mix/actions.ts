"use server";

import { revalidatePath } from "next/cache";
import { requireSuperadmin } from "@/lib/require-superadmin";

export async function updatePromptMix(
    formData: FormData
) {
    const { admin } =
        await requireSuperadmin();

    const promptChainId =
        String(
            formData.get(
                "prompt_chain_id"
            ) ?? ""
        );

    const weight =
        Number(
            formData.get(
                "weight"
            )
        );

    const isActive =
        formData.get(
            "is_active"
        ) === "on";

    if (!promptChainId) {
        throw new Error(
            "Prompt chain ID is required."
        );
    }

    if (
        !Number.isInteger(weight) ||
        weight < 0 ||
        weight > 100
    ) {
        throw new Error(
            "Weight must be a whole number between 0 and 100."
        );
    }

    const { error } =
        await admin
            .from(
                "prompt_chain_mix"
            )
            .update({
                weight,
                is_active:
                isActive,
                updated_at:
                    new Date()
                        .toISOString(),
            })
            .eq(
                "prompt_chain_id",
                promptChainId
            );

    if (error) {
        throw new Error(
            error.message
        );
    }

    revalidatePath(
        "/admin/prompt-mix"
    );
}
