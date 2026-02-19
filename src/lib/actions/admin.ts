"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error("Admin access required");
  }
  return session;
}

export async function addAllowedEmail(formData: FormData) {
  await requireAdmin();

  const email = (formData.get("email") as string)?.toLowerCase().trim();
  if (!email) return { error: "Email is required" };

  const existing = await prisma.allowedEmail.findUnique({ where: { email } });
  if (existing) return { error: "Email already in whitelist" };

  await prisma.allowedEmail.create({ data: { email } });

  revalidatePath("/admin/whitelist");
  return { success: true };
}

export async function addBulkEmails(formData: FormData) {
  await requireAdmin();

  const emailsRaw = formData.get("emails") as string;
  if (!emailsRaw) return { error: "No emails provided" };

  const emails = emailsRaw
    .split(/[\n,;]+/)
    .map((e) => e.toLowerCase().trim())
    .filter((e) => e.length > 0 && e.includes("@"));

  if (emails.length === 0) return { error: "No valid emails found" };

  let added = 0;
  let skipped = 0;

  for (const email of emails) {
    const existing = await prisma.allowedEmail.findUnique({ where: { email } });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.allowedEmail.create({ data: { email } });
    added++;
  }

  revalidatePath("/admin/whitelist");
  return { success: true, added, skipped };
}

export async function removeAllowedEmail(email: string) {
  await requireAdmin();

  await prisma.allowedEmail.delete({ where: { email } }).catch(() => null);

  revalidatePath("/admin/whitelist");
  return { success: true };
}
