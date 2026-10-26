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

                {/* Brand */}

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


                {/* Navigation */}

                <nav className="admin-nav">

                    {/* Overview */}

                    <div className="admin-nav-section">
                        <p className="admin-nav-label">
                            Overview
                        </p>

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
                    </div>


                    {/* Observability */}

                    <div className="admin-nav-section">
                        <p className="admin-nav-label">
                            Observability
                        </p>

                        <Link href="/admin/prompt-chains">
                            Prompt Chains
                        </Link>

                        <Link href="/admin/prompt-mix">
                            Prompt Mix
                        </Link>

                        <Link href="/admin/generation-requests">
                            Generation Requests
                        </Link>

                        <Link href="/admin/llm-responses">
                            LLM Responses
                        </Link>
                    </div>


                    {/* Configuration */}

                    <div className="admin-nav-section">
                        <p className="admin-nav-label">
                            Configuration
                        </p>

                        <Link href="/admin/terms">
                            Terms
                        </Link>

                        <Link href="/admin/examples">
                            Examples
                        </Link>

                        <Link href="/admin/models">
                            Models
                        </Link>

                        <Link href="/admin/providers">
                            Providers
                        </Link>

                        <Link href="/admin/signup-access">
                            Signup Access
                        </Link>

                        <Link href="/admin/images">
                            Images
                        </Link>
                    </div>
                </nav>


                {/* Signed-in user */}

                <div className="admin-sidebar-bottom">
                    <p className="admin-user">
                        Signed in as{" "}
                        <strong>
                            @
                            {profile.username ??
                                "admin"}
                        </strong>
                    </p>

                    <SignOutButton />
                </div>
            </aside>


            {/* Main page content */}

            <main className="admin-content">
                <div className="admin-content-inner">
                    {children}
                </div>
            </main>
        </div>
    );
}

