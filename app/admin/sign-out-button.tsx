"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
    const [signingOut, setSigningOut] =
        useState(false);

    async function signOut() {
        setSigningOut(true);

        const supabase =
            createClient();

        await supabase.auth.signOut();

        window.location.href =
            "/login";
    }

    return (
        <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="admin-signout"
        >
            {signingOut
                ? "Signing out..."
                : "Sign out"}
        </button>
    );
}

