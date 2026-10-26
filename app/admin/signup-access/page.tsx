import { requireSuperadmin } from "@/lib/require-superadmin";

import {
    createDomain,
    createEmail,
    deleteDomain,
    deleteEmail,
    updateDomain,
    updateEmail,
} from "./actions";

export const dynamic =
    "force-dynamic";

export default async function SignupAccessPage() {
    const { admin } =
        await requireSuperadmin();

    const [
        domainsResult,
        emailsResult,
    ] = await Promise.all([
        admin
            .from(
                "allowed_signup_domains"
            )
            .select(
                "id, domain, is_active"
            )
            .order("domain"),

        admin
            .from(
                "whitelisted_emails"
            )
            .select(
                "id, email, is_active"
            )
            .order("email"),
    ]);

    if (domainsResult.error) {
        throw new Error(
            domainsResult.error.message
        );
    }

    if (emailsResult.error) {
        throw new Error(
            emailsResult.error.message
        );
    }

    const domains =
        domainsResult.data ?? [];

    const emails =
        emailsResult.data ?? [];

    return (
        <>
            <header className="admin-page-header">
                <p className="admin-kicker">
                    CONFIGURATION
                </p>

                <h2>
                    Signup Access
                </h2>

                <p className="admin-page-subtitle">
                    Manage allowed email domains
                    and individually whitelisted
                    email addresses.
                </p>
            </header>

            <div className="admin-grid-two">
                <section className="admin-card">
                    <h3>
                        Allowed Signup Domains
                    </h3>

                    <form
                        action={
                            createDomain
                        }
                        className="admin-form"
                    >
                        <label>
                            Domain
                            <input
                                name="domain"
                                placeholder="columbia.edu"
                                required
                            />
                        </label>

                        <button className="admin-button">
                            Add Domain
                        </button>
                    </form>

                    <div
                        className="admin-stack"
                        style={{
                            marginTop:
                                "22px",
                        }}
                    >
                        {domains.map(
                            (
                                domain
                            ) => (
                                <div
                                    key={
                                        domain.id
                                    }
                                    className="admin-record-card"
                                >
                                    <form
                                        action={
                                            updateDomain
                                        }
                                        className="admin-form"
                                    >
                                        <input
                                            type="hidden"
                                            name="id"
                                            value={
                                                domain.id
                                            }
                                        />

                                        <input
                                            name="domain"
                                            defaultValue={
                                                domain.domain
                                            }
                                            required
                                        />

                                        <label
                                            style={{
                                                display:
                                                    "flex",
                                                gridTemplateColumns:
                                                    "auto 1fr",
                                                width:
                                                    "fit-content",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                defaultChecked={
                                                    domain.is_active
                                                }
                                                style={{
                                                    width:
                                                        "auto",
                                                }}
                                            />
                                            Active
                                        </label>

                                        <button className="admin-button">
                                            Save
                                        </button>
                                    </form>

                                    <form
                                        action={
                                            deleteDomain
                                        }
                                    >
                                        <input
                                            type="hidden"
                                            name="id"
                                            value={
                                                domain.id
                                            }
                                        />

                                        <button className="danger-button">
                                            Delete
                                        </button>
                                    </form>
                                </div>
                            )
                        )}
                    </div>
                </section>

                <section className="admin-card">
                    <h3>
                        Whitelisted Emails
                    </h3>

                    <form
                        action={
                            createEmail
                        }
                        className="admin-form"
                    >
                        <label>
                            Email
                            <input
                                type="email"
                                name="email"
                                placeholder="person@example.com"
                                required
                            />
                        </label>

                        <button className="admin-button">
                            Add Email
                        </button>
                    </form>

                    <div
                        className="admin-stack"
                        style={{
                            marginTop:
                                "22px",
                        }}
                    >
                        {emails.map(
                            (
                                email
                            ) => (
                                <div
                                    key={
                                        email.id
                                    }
                                    className="admin-record-card"
                                >
                                    <form
                                        action={
                                            updateEmail
                                        }
                                        className="admin-form"
                                    >
                                        <input
                                            type="hidden"
                                            name="id"
                                            value={
                                                email.id
                                            }
                                        />

                                        <input
                                            type="email"
                                            name="email"
                                            defaultValue={
                                                email.email
                                            }
                                            required
                                        />

                                        <label
                                            style={{
                                                display:
                                                    "flex",
                                                gridTemplateColumns:
                                                    "auto 1fr",
                                                width:
                                                    "fit-content",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                defaultChecked={
                                                    email.is_active
                                                }
                                                style={{
                                                    width:
                                                        "auto",
                                                }}
                                            />
                                            Active
                                        </label>

                                        <button className="admin-button">
                                            Save
                                        </button>
                                    </form>

                                    <form
                                        action={
                                            deleteEmail
                                        }
                                    >
                                        <input
                                            type="hidden"
                                            name="id"
                                            value={
                                                email.id
                                            }
                                        />

                                        <button className="danger-button">
                                            Delete
                                        </button>
                                    </form>
                                </div>
                            )
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}

