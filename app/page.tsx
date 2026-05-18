import React from "react";
import EditorClientWrapper from "./EditorClientWrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PasteMD - Markdown Pastebin",
  description:
    "Paste markdown, optionally set a password and expiration, and get a shareable link. No accounts, no friction.",
  openGraph: {
    title: "PasteMD - Markdown Pastebin",
    description:
      "Paste markdown, optionally set a password and expiration, and get a shareable link. No accounts, no friction.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PasteMD - Markdown Pastebin",
    description:
      "Paste markdown, optionally set a password and expiration, and get a shareable link. No accounts, no friction.",
  },
};

export default function Home() {
  return <EditorClientWrapper />;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
