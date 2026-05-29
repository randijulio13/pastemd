"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Copy,
    Download,
    Share2,
    FileText,
    Code2,
    Calendar,
    Lock,
    Plus,
    Check,
} from "lucide-react";
import { marked } from "marked";
import hljs from "highlight.js";
import "@/lib/marked-mermaid";
import { renderMermaid } from "@/lib/mermaid-config";
import Link from "next/link";

// Import highlight.js style (github-dark theme is beautiful and matches our palette)
import "highlight.js/styles/github-dark.css";

interface PasteViewerProps {
    pasteId: string;
    content: string;
    isPasswordProtected: boolean;
    expiresAt: string | null | undefined;
    createdAt: string;
}

export default function PasteViewer({
    pasteId,
    content,
    isPasswordProtected,
    expiresAt,
    createdAt,
}: PasteViewerProps) {
    const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");
    const [copiedText, setCopiedText] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    // Parse markdown into HTML (pure computation, no cascading renders)
    const previewHtml = useMemo(() => {
        if (!content.trim()) return "";
        try {
            return marked.parse(content) as string;
        } catch {
            return `<p>${content}</p>`;
        }
    }, [content]);

    // Trigger highlight.js & mermaid on the rendered DOM
    useEffect(() => {
        if (viewMode !== "preview" || !previewHtml) return;

        hljs.highlightAll();
        renderMermaid();
    }, [viewMode, previewHtml]);

    // Format dates
    const createdDateStr = useMemo(() => {
        return new Date(createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }, [createdAt]);

    const expiresDateStr = useMemo(() => {
        if (!expiresAt) return null;
        return new Date(expiresAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }, [expiresAt]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedText(true);
            setTimeout(() => setCopiedText(false), 2000);
        } catch (err) {
            console.error("Failed to copy text:", err);
        }
    };

    const copyShareLink = async () => {
        try {
            const shareUrl = window.location.href;
            await navigator.clipboard.writeText(shareUrl);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        } catch (err) {
            console.error("Failed to copy link:", err);
        }
    };

    const downloadPaste = () => {
        const element = document.createElement("a");
        const file = new Blob([content], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = `pastemd_${pasteId}.md`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--color-bg-primary)]">
            {/* Top Header Navigation */}
            <header className="flex h-16 w-full items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4 sm:px-8">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2 rounded-lg py-1.5 font-mono text-sm tracking-wide text-[var(--color-text-muted)] transition-smooth hover:text-[var(--color-text-primary)]"
                >
                    <span className="rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-2.5 py-1">
                        md
                        <span className="text-[var(--color-accent-warm)]">
                            .
                        </span>
                        randijulio
                        <span className="text-[var(--color-accent-warm)]">
                            .
                        </span>
                        cloud
                    </span>
                </Link>

                {/* View Mode Toggle (Preview vs Raw) */}
                <div className="flex rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-0.5">
                    <button
                        type="button"
                        onClick={() => setViewMode("preview")}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-mono font-medium transition-smooth ${
                            viewMode === "preview"
                                ? "bg-[var(--color-accent-warm)] text-[var(--color-bg-primary)] font-semibold"
                                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                        }`}
                    >
                        <FileText className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Preview</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("raw")}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-mono font-medium transition-smooth ${
                            viewMode === "raw"
                                ? "bg-[var(--color-accent-warm)] text-[var(--color-bg-primary)] font-semibold"
                                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                        }`}
                    >
                        <Code2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Raw Code</span>
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    {/* Copy Button */}
                    <button
                        type="button"
                        onClick={copyToClipboard}
                        title="Copy Paste Content"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border-medium)] bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] transition-smooth hover:border-[var(--color-accent-warm)]/50 hover:text-[var(--color-text-primary)]"
                    >
                        {copiedText ? (
                            <Check className="h-4 w-4 text-green-500 animate-scale-up" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                    </button>

                    {/* Download Button */}
                    <button
                        type="button"
                        onClick={downloadPaste}
                        title="Download as .md file"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border-medium)] bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] transition-smooth hover:border-[var(--color-accent-warm)]/50 hover:text-[var(--color-text-primary)]"
                    >
                        <Download className="h-4 w-4" />
                    </button>

                    {/* Share Button */}
                    <button
                        type="button"
                        onClick={copyShareLink}
                        title="Copy Shareable Link"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border-medium)] bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] transition-smooth hover:border-[var(--color-accent-warm)]/50 hover:text-[var(--color-text-primary)]"
                    >
                        {copiedLink ? (
                            <Check className="h-4 w-4 text-green-500 animate-scale-up" />
                        ) : (
                            <Share2 className="h-4 w-4" />
                        )}
                    </button>

                    {/* Divider */}
                    <div className="h-5 w-px bg-[var(--color-border-subtle)] mx-1"></div>

                    {/* New Paste Link */}
                    <Link
                        href="/"
                        className="flex h-9 items-center gap-1.5 rounded-lg bg-[var(--color-accent-warm)] px-3 text-xs font-mono font-bold text-[var(--color-bg-primary)] transition-smooth hover:bg-[var(--color-accent-warm-hover)] hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span className="hidden md:inline">New Paste</span>
                    </Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 md:px-16 lg:px-24">
                <div className="mx-auto w-full max-w-4xl animate-fade-in pb-24">
                    {/* Metadata Bar */}
                    <div className="mb-8 flex flex-wrap items-center gap-3 border-b border-[var(--color-border-subtle)] pb-4 text-xs font-mono text-[var(--color-text-muted)]">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Created {createdDateStr}</span>
                        </div>

                        {expiresDateStr && (
                            <>
                                <div className="h-3 w-px bg-[var(--color-border-subtle)]"></div>
                                <div className="flex items-center gap-1 text-[var(--color-accent-warm)]">
                                    <span>Expires: {expiresDateStr}</span>
                                </div>
                            </>
                        )}

                        {isPasswordProtected && (
                            <>
                                <div className="h-3 w-px bg-[var(--color-border-subtle)]"></div>
                                <div className="flex items-center gap-1 rounded bg-[var(--color-accent-warm)]/10 px-1.5 py-0.5 text-[var(--color-accent-warm)]">
                                    <Lock className="h-3 w-3" />
                                    <span>Password Protected</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Notifications */}
                    {(copiedText || copiedLink) && (
                        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-green-500/20 bg-green-950/30 px-4 py-3 text-sm text-green-400 backdrop-blur-md animate-slide-up shadow-lg">
                            {copiedText
                                ? "Content copied to clipboard!"
                                : "Share link copied to clipboard!"}
                        </div>
                    )}

                    {/* Toggle Rendering Mode */}
                    {viewMode === "preview" ? (
                        <div
                            className="prose-custom max-w-none break-words"
                            dangerouslySetInnerHTML={{ __html: previewHtml }}
                        />
                    ) : (
                        <div className="relative rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-6 shadow-2xl">
                            <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-[#c9d1d9] whitespace-pre-wrap break-all select-all">
                                <code>{content}</code>
                            </pre>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
