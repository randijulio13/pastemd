"use client";

import React from "react";
import nextDynamic from "next/dynamic";

// Dynamically load the HomeEditor on the client-side only (ssr: false) to prevent hydration mismatches
const HomeEditor = nextDynamic(() => import("./HomeEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-[#07090e] font-mono text-sm text-[#64748b]">
      Loading PasteMD Editor...
    </div>
  ),
});

export default function EditorClientWrapper() {
  return <HomeEditor />;
}
