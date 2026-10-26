"use server";

import { revalidatePath } from "next/cache";
import { requireSuperadmin } from "@/lib/require-superadmin";


export async function createDomain(
    formData: FormData
) {
    const { admin } =
        await requireSuperadmin();

    const domain =
        String(
            formData.get(
                "domain"
            ) ?? ""
        )
            .trim()
            .toLowerCase()
            .replace(/^@/, "");

    if (
        !domain ||
        !domain.includes(".")
    ) {
        throw new Error(
            "Enter a valid domain."
        );
    }

    const { error } =
        await admin
            .from(
                "allowed_signup_domains"
            )
            .insert({
                domain,
                is_active:
                    true,
            });

    if (error) {
        throw new Error(
            error.message
        );
    }

    revalidatePath(
        "/admin/signup-access"
    );
}


export async function updateDomain(
    formData: FormData
) {
    const { admin } =
        await requireSuperadmin();

    const id =
        String(
            formData.get("id") ??
            ""
        );

    const domain =
        String(
            formData.get(
                "domain"
            ) ?? ""
        )
            .trim()
            .toLowerCase()
            .replace(/^@/, "");

    const isActive =
        formData.get(
            "is_active"
        ) === "on";

    const { error } =
        await admin
            .from(
                "allowed_signup_domains"
            )
            .update({
                domain,
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
        "/admin/signup-access"
    );
}


export async function deleteDomain(
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
                "allowed_signup_domains"
            )
            .delete()
            .eq("id", id);

    if (error) {
        throw new Error(
            error.message
        );
    }

    revalidatePath(
        "/admin/signup-access"
    );
}


export async function createEmail(
    formData: FormData
) {
    const { admin } =
        await requireSuperadmin();

    const email =
        String(
            formData.get(
                "email"
            ) ?? ""
        )
            .trim()
            .toLowerCase();

    if (
        !email.includes("@")
    ) {
        throw new Error(
            "Enter a valid email address."
        );
    }

    const { error } =
        await admin
            .from(
                "whitelisted_emails"
            )
            .insert({
                email,
                is_active:
                    true,
            });

    if (error) {
        throw new Error(
            error.message
        );
    }

    revalidatePath(
        "/admin/signup-access"
    );
}


export async function updateEmail(
    formData: FormData
) {
    const { admin } =
        await requireSuperadmin();

    const id =
        String(
            formData.get("id") ??
            ""
        );

    const email =
        String(
            formData.get(
                "email"
            ) ?? ""
        )
            .trim()
            .toLowerCase();

    const isActive =
        formData.get(
            "is_active"
        ) === "on";

    const { error } =
        await admin
            .from(
                "whitelisted_emails"
            )
            .update({
                email,
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
        "/admin/signup-access"
    );
}


export async function deleteEmail(
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
                "whitelisted_emails"
            )
            .delete()
            .eq("id", id);

    if (error) {
        throw new Error(
            error.message
        );
    }

    revalidatePath(
        "/admin/signup-access"
    );
}

