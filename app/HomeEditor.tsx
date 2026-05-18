"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import hljs from "highlight.js";
import {
    Bold,
    Italic,
    Code,
    SquareTerminal,
    Quote,
    Link as LinkIcon,
    Image as ImageIcon,
    List,
    ListOrdered,
    Table,
    Sparkles,
    Lock,
    Eye,
    EyeOff,
    Calendar,
    ArrowRight,
    Loader2,
    FileText,
    Eye as EyeIcon,
    Check,
    Copy,
} from "lucide-react";
import { createPasteAction } from "@/lib/actions";

import "highlight.js/styles/github-dark.css";

export default function HomeEditor() {
    const [content, setContent] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [expiration, setExpiration] = useState("never");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [successId, setSuccessId] = useState<string | null>(null);

    // Mobile states
    const [mobileTab, setMobileTab] = useState<"write" | "preview">("write");

    const router = useRouter();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Stats
    const charCount = content.length;
    const wordCount = useMemo(() => {
        const trimmed = content.trim();
        return trimmed ? trimmed.split(/\s+/).length : 0;
    }, [content]);

    // Syntax highlighting trigger
    useEffect(() => {
        if (content) {
            hljs.highlightAll();
        }
    }, [content, mobileTab]);

    // Handle live markdown parsing
    const parsedHtml = useMemo(() => {
        if (!content.trim()) {
            return `<p class="text-[var(--color-text-muted)] italic font-sans">Nothing to preview yet. Start typing on the left...</p>`;
        }
        try {
            return marked.parse(content) as string;
        } catch (e) {
            return `<p>${content}</p>`;
        }
    }, [content]);

    // Inject markdown tags helper
    const injectMarkdown = (type: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selection = content.substring(start, end);

        let replacement = "";
        let cursorOffset = 0;

        switch (type) {
            case "bold":
                replacement = `**${selection || "bold text"}**`;
                cursorOffset = selection ? 0 : 2;
                break;
            case "italic":
                replacement = `*${selection || "italic text"}*`;
                cursorOffset = selection ? 0 : 1;
                break;
            case "code":
                replacement = `\`${selection || "code"}\``;
                cursorOffset = selection ? 0 : 1;
                break;
            case "code-block":
                replacement = `\n\`\`\`javascript\n${selection || "// code here"}\n\`\`\`\n`;
                cursorOffset = selection ? 0 : 15;
                break;
            case "quote":
                replacement = `\n> ${selection || "quote text"}\n`;
                cursorOffset = selection ? 0 : 4;
                break;
            case "link":
                replacement = `[${selection || "link text"}](https://example.com)`;
                cursorOffset = selection ? 0 : 21;
                break;
            case "image":
                replacement = `![${selection || "alt text"}](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe)`;
                cursorOffset = selection ? 0 : 77;
                break;
            case "list":
                replacement = `\n- ${selection || "list item"}\n`;
                cursorOffset = selection ? 0 : 4;
                break;
            case "list-ordered":
                replacement = `\n1. ${selection || "list item"}\n`;
                cursorOffset = selection ? 0 : 5;
                break;
            case "table":
                replacement = `\n| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n`;
                break;
            default:
                return;
        }

        const newContent =
            content.substring(0, start) + replacement + content.substring(end);
        setContent(newContent);

        // Refocus and place cursor
        setTimeout(() => {
            textarea.focus();
            if (selection) {
                textarea.setSelectionRange(start, start + replacement.length);
            } else {
                const newCursorPos = start + replacement.length - cursorOffset;
                textarea.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    const handleCreatePaste = async () => {
        if (!content.trim()) return;
        setIsSubmitting(true);
        setError("");

        try {
            const res = await createPasteAction(content, password, expiration);
            if (res.success && res.data) {
                setSuccessId(res.data.id);
                // Clean form and redirect
                router.push(`/p/${res.data.id}`);
            } else {
                setError(res.error || "Failed to create paste");
                setIsSubmitting(false);
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--color-bg-primary)]">
            {/* Header (Logo & Stats) */}
            <header className="flex h-14 w-full items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4 sm:px-6">
                <div className="flex items-center gap-3">
                    <div className="cursor-default rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-1 font-mono text-sm tracking-wide text-[var(--color-text-muted)] transition-smooth hover:text-[var(--color-text-primary)]">
                        pastemd
                        <span className="text-[var(--color-accent-warm)]">
                            .
                        </span>
                        com
                    </div>
                    <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500 sm:flex">
                        <Sparkles className="h-3 w-3 animate-pulse" />
                        Markdown Pastebin
                    </span>
                </div>

                {/* Word/Char Counter */}
                <div className="flex items-center gap-4 text-xs font-mono text-[var(--color-text-muted)]">
                    <div className="flex gap-3 border-r border-[var(--color-border-subtle)] pr-4">
                        <span>
                            words:{" "}
                            <strong className="text-[var(--color-text-primary)]">
                                {wordCount}
                            </strong>
                        </span>
                        <span>
                            chars:{" "}
                            <strong className="text-[var(--color-text-primary)]">
                                {charCount}
                            </strong>
                        </span>
                    </div>
                    <div className="hidden text-xs text-[var(--color-text-muted)] md:block">
                        Press{" "}
                        <kbd className="rounded border border-[var(--color-border-medium)] bg-[var(--color-bg-surface)] px-1 py-0.5">
                            Tab
                        </kbd>{" "}
                        to indent
                    </div>
                </div>
            </header>

            {/* Editor & Preview Split Panel */}
            <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
                {/* Mobile Navigation Tabs */}
                <div className="flex justify-center border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-2 md:hidden">
                    <div className="flex rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-0.5">
                        <button
                            type="button"
                            onClick={() => setMobileTab("write")}
                            className={`flex min-h-[36px] min-w-[100px] items-center justify-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-mono font-medium transition-smooth ${
                                mobileTab === "write"
                                    ? "bg-[var(--color-accent-warm)] text-[var(--color-bg-primary)] font-semibold"
                                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                            }`}
                        >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Write</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileTab("preview")}
                            className={`flex min-h-[36px] min-w-[100px] items-center justify-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-mono font-medium transition-smooth ${
                                mobileTab === "preview"
                                    ? "bg-[var(--color-accent-warm)] text-[var(--color-bg-primary)] font-semibold"
                                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                            }`}
                        >
                            <EyeIcon className="h-3.5 w-3.5" />
                            <span>Preview</span>
                        </button>
                    </div>
                </div>

                {/* 1. EDITOR PANEL */}
                <div
                    className={`flex flex-1 flex-col overflow-hidden md:flex md:w-[45%] md:border-r md:border-[var(--color-border-subtle)] ${
                        mobileTab === "write" ? "flex" : "hidden"
                    }`}
                >
                    {/* Helper toolbar */}
                    <div className="flex h-10 w-full items-center gap-1 overflow-x-auto border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]/60 px-3 py-1">
                        <button
                            type="button"
                            onClick={() => injectMarkdown("bold")}
                            title="Bold"
                            className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-text-muted)] transition-smooth hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)]"
                        >
                            <Bold className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => injectMarkdown("italic")}
                            title="Italic"
                            className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-text-muted)] transition-smooth hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)]"
                        >
                            <Italic className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => injectMarkdown("code")}
                            title="Code Inline"
                            className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-text-muted)] transition-smooth hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)]"
                        >
                            <Code className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => injectMarkdown("code-block")}
                            title="Code Block"
                            className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-text-muted)] transition-smooth hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)]"
                        >
                            <SquareTerminal className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => injectMarkdown("quote")}
                            title="Blockquote"
                            className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-text-muted)] transition-smooth hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)]"
                        >
                            <Quote className="h-4 w-4" />
                        </button>
                        <div className="h-4 w-px bg-[var(--color-border-subtle)] mx-1"></div>
                        <button
                            type="button"
                            onClick={() => injectMarkdown("link")}
                            title="Insert Link"
                            className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-text-muted)] transition-smooth hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)]"
                        >
                            <LinkIcon className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => injectMarkdown("image")}
                            title="Insert Image"
                            className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-text-muted)] transition-smooth hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)]"
                        >
                            <ImageIcon className="h-4 w-4" />
                        </button>
                        <div className="h-4 w-px bg-[var(--color-border-subtle)] mx-1"></div>
                        <button
                            type="button"
                            onClick={() => injectMarkdown("list")}
                            title="Unordered List"
                            className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-text-muted)] transition-smooth hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)]"
                        >
                            <List className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => injectMarkdown("list-ordered")}
                            title="Ordered List"
                            className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-text-muted)] transition-smooth hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)]"
                        >
                            <ListOrdered className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => injectMarkdown("table")}
                            title="Table Grid"
                            className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-text-muted)] transition-smooth hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)]"
                        >
                            <Table className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Text Area */}
                    <div className="flex-1 bg-[var(--color-bg-primary)] px-6 py-6 overflow-y-auto">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Paste or write your Markdown text here... (Live Preview instantly compiles on the right)"
                            spellCheck="false"
                            className="h-full w-full resize-none border-0 bg-transparent font-mono text-[15px] leading-relaxed text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
                            style={{ caretColor: "var(--color-accent-warm)" }}
                            onKeyDown={(e) => {
                                // Support tab indentation inside textarea
                                if (e.key === "Tab") {
                                    e.preventDefault();
                                    const start =
                                        e.currentTarget.selectionStart;
                                    const end = e.currentTarget.selectionEnd;
                                    const newContent =
                                        content.substring(0, start) +
                                        "  " +
                                        content.substring(end);
                                    setContent(newContent);
                                    setTimeout(() => {
                                        if (textareaRef.current) {
                                            textareaRef.current.selectionStart =
                                                textareaRef.current.selectionEnd =
                                                    start + 2;
                                        }
                                    }, 0);
                                }
                            }}
                        />
                    </div>
                </div>

                {/* 2. PREVIEW PANEL */}
                <div
                    className={`flex-1 flex-col overflow-y-auto bg-[var(--color-bg-primary)] px-6 py-8 sm:px-10 md:flex md:w-[55%] md:py-12 ${
                        mobileTab === "preview"
                            ? "flex animate-fade-in"
                            : "hidden md:flex"
                    }`}
                >
                    <div className="mx-auto w-full max-w-3xl pb-32">
                        <div
                            className="prose-custom max-w-none break-words"
                            dangerouslySetInnerHTML={{ __html: parsedHtml }}
                        />
                    </div>
                </div>
            </div>

            {/* Floating Bottom Panel (Settings & Creation) */}
            <div className="fixed bottom-4 left-4 right-4 z-40 animate-slide-up sm:bottom-6 sm:left-6 sm:right-6">
                <div
                    className="mx-auto max-w-4xl rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]/90 p-4 shadow-2xl backdrop-blur-xl transition-smooth"
                    style={{
                        boxShadow:
                            "0 20px 40px -15px rgba(0,0,0,0.7), 0 0 0 1px var(--color-border-subtle)",
                    }}
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Setting Inputs */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 flex-1">
                            {/* Password Protection */}
                            <div className="relative flex-1 max-w-xs">
                                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password (optional)"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-[var(--color-border-medium)] bg-[var(--color-bg-surface)] py-2.5 pl-10 pr-10 text-xs text-[var(--color-text-primary)] outline-none transition-smooth placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-warm)] focus:ring-2 focus:ring-[var(--color-accent-warm)]/15"
                                />
                                {password && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-smooth"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Expiration Selector */}
                            <div className="relative">
                                <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                                <select
                                    value={expiration}
                                    onChange={(e) =>
                                        setExpiration(e.target.value)
                                    }
                                    className="w-full appearance-none rounded-xl border border-[var(--color-border-medium)] bg-[var(--color-bg-surface)] py-2.5 pl-10 pr-10 text-xs text-[var(--color-text-primary)] outline-none transition-smooth focus:border-[var(--color-accent-warm)] focus:ring-2 focus:ring-[var(--color-accent-warm)]/15 cursor-pointer"
                                >
                                    <option value="never">Never expire</option>
                                    <option value="1h">Expire in 1 Hour</option>
                                    <option value="1d">Expire in 1 Day</option>
                                    <option value="1w">Expire in 1 Week</option>
                                    <option value="1m">
                                        Expire in 1 Month
                                    </option>
                                </select>
                                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-[var(--color-text-muted)] h-0 w-0"></div>
                            </div>
                        </div>

                        {/* Error notifications */}
                        {error && (
                            <span className="text-xs text-red-400 font-mono self-center px-2 animate-fade-in">
                                {error}
                            </span>
                        )}

                        {/* Create Paste Button */}
                        <button
                            type="button"
                            disabled={isSubmitting || !content.trim()}
                            onClick={handleCreatePaste}
                            className="group relative shrink-0 overflow-hidden rounded-xl bg-[var(--color-accent-warm)] px-6 py-2.5 font-mono text-xs font-semibold text-[var(--color-bg-primary)] transition-smooth hover:-translate-y-0.5 hover:bg-[var(--color-accent-warm-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 shadow-[0_4px_12px_rgba(249,115,22,0.2)]"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        <span>Publishing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Paste</span>
                                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 stroke-[2.5]" />
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
