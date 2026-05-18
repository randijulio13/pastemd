"use client";

import React, { useState } from "react";
import { Lock, Unlock, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { verifyPastePasswordAction } from "@/lib/actions";
import Link from "next/link";
import PasteViewer from "./PasteViewer";

interface PasswordPromptProps {
  pasteId: string;
  expiresAt: string | null | undefined;
  createdAt: string;
}

export default function PasswordPrompt({ pasteId, expiresAt, createdAt }: PasswordPromptProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unlockedContent, setUnlockedContent] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter the password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await verifyPastePasswordAction(pasteId, password);
      if (res.success && res.data) {
        setUnlockedContent(res.data);
      } else {
        setError(res.error || "Incorrect password");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // If unlocked, render the viewer directly!
  if (unlockedContent !== null) {
    return (
      <PasteViewer
        pasteId={pasteId}
        content={unlockedContent}
        isPasswordProtected={true}
        expiresAt={expiresAt}
        createdAt={createdAt}
      />
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[var(--color-bg-primary)] px-6 py-12">
      {/* Back link */}
      <Link
        href="/"
        className="absolute left-6 top-6 flex items-center gap-2 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-1.5 font-mono text-sm tracking-wide text-[var(--color-text-muted)] shadow-sm transition-smooth hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-medium)]"
      >
        pastemd<span className="text-[var(--color-accent-warm)]">.</span>com
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-8 shadow-2xl animate-slide-up">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent-warm)]/10 text-[var(--color-accent-warm)] shadow-[0_0_15px_rgba(249,115,22,0.1)]">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-3xl">
            Password Protected
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            This paste is private. Enter the decryption password to view its contents.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter decryption password"
              disabled={loading}
              className="w-full rounded-xl border border-[var(--color-border-medium)] bg-[var(--color-bg-surface)] py-3.5 pl-4 pr-12 text-sm text-[var(--color-text-primary)] outline-none transition-smooth placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-warm)] focus:ring-2 focus:ring-[var(--color-accent-warm)]/20"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-smooth"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-950/30 border border-red-500/20 px-4 py-3 text-sm text-red-400 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-warm)] py-3.5 font-mono text-sm font-semibold text-[var(--color-bg-primary)] transition-smooth hover:bg-[var(--color-accent-warm-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Decrypting...</span>
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4" />
                <span>Decrypt Paste</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-smooth"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Back to editor</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
