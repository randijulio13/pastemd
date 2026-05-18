import React from "react";
import { getPaste } from "@/lib/db";
import PasswordPrompt from "./PasswordPrompt";
import PasteViewer from "./PasteViewer";
import Link from "next/link";
import { AlertTriangle, Home, Plus } from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const paste = await getPaste(id);
  if (!paste) {
    return {
      title: "Paste Not Found - PasteMD",
      description: "This paste does not exist or has expired.",
    };
  }
  return {
    title: `Paste ${id} - PasteMD`,
    description: paste.isPasswordProtected
      ? "This paste is password protected."
      : paste.content.substring(0, 150) + "...",
  };
}

export default async function PastePage({ params }: PageProps) {
  const { id } = await params;
  const paste = await getPaste(id);

  // Handle not found or expired
  if (!paste) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[var(--color-bg-primary)] px-6 py-12 text-center">
        <div className="w-full max-w-md rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-8 shadow-2xl animate-slide-up">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-950/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-3xl">
            Paste Not Found
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
            This paste never existed, has been deleted, or has reached its expiration date and has been scrubbed from our systems.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-warm)] px-6 py-3 font-mono text-sm font-semibold text-[var(--color-bg-primary)] transition-smooth hover:bg-[var(--color-accent-warm-hover)] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Create New Paste</span>
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border-medium)] bg-[var(--color-bg-surface)] px-6 py-3 font-mono text-sm font-medium text-[var(--color-text-primary)] transition-smooth hover:border-[var(--color-accent-warm)]/50"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle password protected paste
  if (paste.isPasswordProtected) {
    return (
      <PasswordPrompt
        pasteId={paste.id}
        expiresAt={paste.expiresAt}
        createdAt={paste.createdAt}
      />
    );
  }

  // Handle public paste
  return (
    <PasteViewer
      pasteId={paste.id}
      content={paste.content}
      isPasswordProtected={false}
      expiresAt={paste.expiresAt}
      createdAt={paste.createdAt}
    />
  );
}
export const dynamic = "force-dynamic";
export const revalidate = 0;
