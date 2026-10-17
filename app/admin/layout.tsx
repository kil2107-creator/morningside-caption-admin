import Link from "next/link";
import { requireSuperadmin } from "@/lib/require-superadmin";
import SignOutButton from "./sign-out-button";

export default async function AdminLayout({
                                              children,
                                          }: {
    children: React.ReactNode;
}) {
    const { profile } =
        await requireSuperadmin();

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div>
                    <p className="admin-kicker">
                        MCC ADMIN
                    </p>

                    <h1 className="admin-logo">
                        Morningside
                        <br />
                        Caption Club
                    </h1>
                </div>

                <nav className="admin-nav">
                    <Link href="/admin">
                        Dashboard
                    </Link>

                    <Link href="/admin/profiles">
                        Profiles
                    </Link>

                    <Link href="/admin/media">
                        AI Media
                    </Link>

                    <Link href="/admin/votes">
                        Votes
                    </Link>
                </nav>

                <p className="admin-user">
                    Signed in as{" "}
                    <strong>
                        @
                        {profile.username ??
                            "admin"}
                    </strong>
                </p>

                <SignOutButton />
            </aside>

            <main className="admin-content">
                <div className="admin-content-inner">
                    {children}
                </div>
            </main>
        </div>
    );
}