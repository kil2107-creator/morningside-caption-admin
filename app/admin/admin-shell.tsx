"use client";

import type {
    ReactNode,
} from "react";

import {
    useState,
} from "react";

import Link from "next/link";

import SignOutButton from "./sign-out-button";


type Props = {
    children: ReactNode;
    username: string;
};


export default function AdminShell({
                                       children,
                                       username,
                                   }: Props) {
    const [
        collapsed,
        setCollapsed,
    ] = useState(false);


    return (
        <div
            className={
                collapsed
                    ? "admin-shell admin-shell-collapsed"
                    : "admin-shell"
            }
        >

            {/* Sidebar */}

            <aside className="admin-sidebar">

                {/* Collapse button */}

                <button
                    type="button"
                    className="admin-collapse-button"
                    onClick={() =>
                        setCollapsed(
                            (
                                current
                            ) =>
                                !current
                        )
                    }
                    aria-label={
                        collapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                    title={
                        collapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                >
                    {collapsed
                        ? "→"
                        : "←"}
                </button>


                {/* Brand */}

                <div className="admin-brand-expanded">
                    <p className="admin-kicker">
                        MCC ADMIN
                    </p>

                    <h1 className="admin-logo">
                        Morningside
                        <br />
                        Caption Club
                    </h1>
                </div>


                <div className="admin-brand-collapsed">
                    MCC
                </div>


                {/* Navigation */}

                <nav className="admin-nav">

                    {/* Overview */}

                    <div className="admin-nav-section">
                        <p className="admin-nav-label">
                            Overview
                        </p>

                        <Link
                            href="/admin"
                            title="Dashboard"
                        >
                            <span className="admin-nav-full">
                                Dashboard
                            </span>

                            <span className="admin-nav-short">
                                D
                            </span>
                        </Link>

                        <Link
                            href="/admin/profiles"
                            title="Profiles"
                        >
                            <span className="admin-nav-full">
                                Profiles
                            </span>

                            <span className="admin-nav-short">
                                P
                            </span>
                        </Link>

                        <Link
                            href="/admin/media"
                            title="AI Media"
                        >
                            <span className="admin-nav-full">
                                AI Media
                            </span>

                            <span className="admin-nav-short">
                                M
                            </span>
                        </Link>

                        <Link
                            href="/admin/votes"
                            title="Votes"
                        >
                            <span className="admin-nav-full">
                                Votes
                            </span>

                            <span className="admin-nav-short">
                                V
                            </span>
                        </Link>
                    </div>


                    {/* Observability */}

                    <div className="admin-nav-section">
                        <p className="admin-nav-label">
                            Observability
                        </p>

                        <Link
                            href="/admin/prompt-chains"
                            title="Prompt Chains"
                        >
                            <span className="admin-nav-full">
                                Prompt Chains
                            </span>

                            <span className="admin-nav-short">
                                PC
                            </span>
                        </Link>

                        <Link
                            href="/admin/prompt-mix"
                            title="Prompt Mix"
                        >
                            <span className="admin-nav-full">
                                Prompt Mix
                            </span>

                            <span className="admin-nav-short">
                                PM
                            </span>
                        </Link>

                        <Link
                            href="/admin/generation-requests"
                            title="Generation Requests"
                        >
                            <span className="admin-nav-full">
                                Generation Requests
                            </span>

                            <span className="admin-nav-short">
                                GR
                            </span>
                        </Link>

                        <Link
                            href="/admin/llm-responses"
                            title="LLM Responses"
                        >
                            <span className="admin-nav-full">
                                LLM Responses
                            </span>

                            <span className="admin-nav-short">
                                LR
                            </span>
                        </Link>
                    </div>


                    {/* Configuration */}

                    <div className="admin-nav-section">
                        <p className="admin-nav-label">
                            Configuration
                        </p>

                        <Link
                            href="/admin/terms"
                            title="Terms"
                        >
                            <span className="admin-nav-full">
                                Terms
                            </span>

                            <span className="admin-nav-short">
                                T
                            </span>
                        </Link>

                        <Link
                            href="/admin/examples"
                            title="Examples"
                        >
                            <span className="admin-nav-full">
                                Examples
                            </span>

                            <span className="admin-nav-short">
                                E
                            </span>
                        </Link>

                        <Link
                            href="/admin/models"
                            title="Models"
                        >
                            <span className="admin-nav-full">
                                Models
                            </span>

                            <span className="admin-nav-short">
                                MO
                            </span>
                        </Link>

                        <Link
                            href="/admin/providers"
                            title="Providers"
                        >
                            <span className="admin-nav-full">
                                Providers
                            </span>

                            <span className="admin-nav-short">
                                PR
                            </span>
                        </Link>

                        <Link
                            href="/admin/signup-access"
                            title="Signup Access"
                        >
                            <span className="admin-nav-full">
                                Signup Access
                            </span>

                            <span className="admin-nav-short">
                                SA
                            </span>
                        </Link>

                        <Link
                            href="/admin/images"
                            title="Images"
                        >
                            <span className="admin-nav-full">
                                Images
                            </span>

                            <span className="admin-nav-short">
                                I
                            </span>
                        </Link>
                    </div>
                </nav>


                {/* Signed-in user */}

                <div className="admin-sidebar-bottom">
                    <p className="admin-user">
                        Signed in as{" "}

                        <strong>
                            @
                            {
                                username
                            }
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

