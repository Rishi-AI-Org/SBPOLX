"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(100),
  phoneNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
    .optional()
    .or(z.literal("")),
  hostelNumber: z.string().max(10).optional().or(z.literal("")),
  roomNumber: z.string().max(10).optional().or(z.literal("")),
});

export async function updateProfile(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const raw = {
    displayName: formData.get("displayName") as string,
    phoneNumber: (formData.get("phoneNumber") as string) || "",
    hostelNumber: (formData.get("hostelNumber") as string) || "",
    roomNumber: (formData.get("roomNumber") as string) || "",
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { displayName, phoneNumber, hostelNumber, roomNumber } = parsed.data;

  await prisma.user.update({
    where: { id: Number(session.user.id) },
    data: {
      displayName,
      phoneNumber: phoneNumber || null,
      hostelNumber: hostelNumber || null,
      roomNumber: roomNumber || null,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}
