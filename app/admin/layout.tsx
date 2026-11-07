import type {
    ReactNode,
} from "react";

import {
    requireSuperadmin,
} from "@/lib/require-superadmin";

import AdminShell from "./admin-shell";


export default async function AdminLayout({
                                              children,
                                          }: {
    children: ReactNode;
}) {
    const {
        profile,
    } =
        await requireSuperadmin();


    return (
        <AdminShell
            username={
                profile.username ??
                "admin"
            }
        >
            {children}
        </AdminShell>
    );
}

