import { requireSuperadmin } from "@/lib/require-superadmin";

export const dynamic = "force-dynamic";

export default async function ProfilesPage() {
    const { admin } =
        await requireSuperadmin();

    const {
        data: profiles,
        error,
    } = await admin
        .from("profiles")
        .select(
            "id, first_name, last_name, username, avatar_path, is_superadmin, created_at"
        )
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        return (
            <p>
                Error loading profiles:{" "}
                {error.message}
            </p>
        );
    }

    return (
        <>
            <header className="admin-page-header">
                <div>
                    <p className="admin-kicker">
                        USERS
                    </p>

                    <h2>Profiles</h2>
                </div>
            </header>

            <section className="admin-card table-wrap">
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>Username</th>
                        <th>Name</th>
                        <th>User ID</th>
                        <th>Role</th>
                        <th>Joined</th>
                    </tr>
                    </thead>

                    <tbody>
                    {(profiles ?? []).map(
                        (profile) => (
                            <tr
                                key={
                                    profile.id
                                }
                            >
                                <td>
                                    @
                                    {profile.username ??
                                        "none"}
                                </td>

                                <td>
                                    {[
                                            profile.first_name,
                                            profile.last_name,
                                        ]
                                            .filter(
                                                Boolean
                                            )
                                            .join(
                                                " "
                                            ) ||
                                        "—"}
                                </td>

                                <td className="mono">
                                    {
                                        profile.id
                                    }
                                </td>

                                <td>
                                    {profile.is_superadmin
                                        ? "Superadmin"
                                        : "User"}
                                </td>

                                <td>
                                    {profile.created_at
                                        ? new Date(
                                            profile.created_at
                                        ).toLocaleDateString()
                                        : "—"}
                                </td>
                            </tr>
                        )
                    )}
                    </tbody>
                </table>
            </section>
        </>
    );
}

