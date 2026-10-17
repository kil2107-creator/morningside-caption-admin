import { requireSuperadmin } from "@/lib/require-superadmin";

export const dynamic = "force-dynamic";

export default async function VotesPage() {
    const { admin } =
        await requireSuperadmin();

    const [
        votesResult,
        profilesResult,
        captionsResult,
    ] = await Promise.all([
        admin
            .from("votes")
            .select(
                "id, generation_id, user_id, value, created_at"
            )
            .order("created_at", {
                ascending: false,
            }),

        admin
            .from("profiles")
            .select(
                "id, username"
            ),

        admin
            .from(
                "caption_generations"
            )
            .select(
                "id, caption"
            ),
    ]);

    const votes =
        votesResult.data ?? [];

    const profileMap =
        new Map(
            (
                profilesResult.data ??
                []
            ).map(
                (profile) => [
                    profile.id,
                    profile.username,
                ]
            )
        );

    const captionMap =
        new Map(
            (
                captionsResult.data ??
                []
            ).map(
                (caption) => [
                    caption.id,
                    caption.caption,
                ]
            )
        );

    return (
        <>
            <header className="admin-page-header">
                <div>
                    <p className="admin-kicker">
                        ENGAGEMENT
                    </p>

                    <h2>Votes</h2>
                </div>
            </header>

            <section className="admin-card table-wrap">
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>User</th>
                        <th>Vote</th>
                        <th>Caption</th>
                        <th>Time</th>
                    </tr>
                    </thead>

                    <tbody>
                    {votes.map(
                        (vote) => (
                            <tr
                                key={
                                    vote.id
                                }
                            >
                                <td>
                                    @
                                    {profileMap.get(
                                            vote.user_id
                                        ) ??
                                        "unknown"}
                                </td>

                                <td>
                                    {vote.value ===
                                    1
                                        ? "↑ Upvote"
                                        : "↓ Downvote"}
                                </td>

                                <td>
                                    “
                                    {captionMap.get(
                                            vote.generation_id
                                        ) ??
                                        "Deleted caption"}
                                    ”
                                </td>

                                <td>
                                    {new Date(
                                        vote.created_at
                                    ).toLocaleString()}
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

