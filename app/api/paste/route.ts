import { NextResponse } from "next/server";
import { createPaste } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, password, expiration } = body;

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const newPaste = await createPaste(content, password, expiration);
    
    // Get host URL
    const origin = request.headers.get("origin") || "";
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const pasteUrl = `${protocol}://${host}/p/${newPaste.id}`;

    return NextResponse.json({
      success: true,
      id: newPaste.id,
      url: pasteUrl,
      isPasswordProtected: newPaste.isPasswordProtected,
      expiresAt: newPaste.expiresAt,
      createdAt: newPaste.createdAt,
    });
  } catch (error: any) {
    console.error("API error creating paste:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create paste" },
      { status: 500 }
    );
  }
}
