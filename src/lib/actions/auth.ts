"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().min(1, "Display name is required").max(100),
});

export async function signup(formData: FormData) {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password, displayName } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Check whitelist
  const allowed = await prisma.allowedEmail.findUnique({
    where: { email: normalizedEmail },
  });

  if (!allowed) {
    return { error: "This email is not authorized to register." };
  }

  // Check if already registered
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    return { error: "An account with this email already exists." };
  }

  // Create user
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      displayName,
    },
  });

  return { success: true };
}
