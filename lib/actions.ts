"use server";

import { createPaste, getPaste, verifyPassword, Paste, cleanupExpired } from "./db";

export interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createPasteAction(
  content: string,
  password?: string,
  expiration?: string
): Promise<ActionResponse<Paste>> {
  try {
    if (!content || content.trim() === "") {
      return { success: false, error: "Content cannot be empty" };
    }

    // Clean up expired pastes in the background
    cleanupExpired().catch((err) => console.error("Error cleaning up expired pastes:", err));

    const newPaste = await createPaste(content, password, expiration);
    
    // We omit password details before sending to the client
    const safePaste: Paste = {
      id: newPaste.id,
      content: newPaste.content,
      expiresAt: newPaste.expiresAt,
      createdAt: newPaste.createdAt,
      isPasswordProtected: newPaste.isPasswordProtected,
    };

    return { success: true, data: safePaste };
  } catch (error: any) {
    console.error("Action error creating paste:", error);
    return { success: false, error: error.message || "Failed to create paste" };
  }
}

export async function verifyPastePasswordAction(
  id: string,
  password?: string
): Promise<ActionResponse<string>> {
  try {
    const paste = await getPaste(id);

    if (!paste) {
      return { success: false, error: "Paste not found or has expired" };
    }

    if (!paste.isPasswordProtected) {
      return { success: true, data: paste.content };
    }

    if (!password) {
      return { success: false, error: "Password is required" };
    }

    if (!paste.passwordHash || !paste.passwordSalt) {
      return { success: false, error: "Invalid password configuration on server" };
    }

    const isMatch = verifyPassword(password, paste.passwordHash, paste.passwordSalt);

    if (!isMatch) {
      return { success: false, error: "Incorrect password" };
    }

    return { success: true, data: paste.content };
  } catch (error: any) {
    console.error("Action error verifying password:", error);
    return { success: false, error: error.message || "Failed to verify password" };
  }
}
