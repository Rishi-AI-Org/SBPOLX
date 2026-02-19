"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
});

export async function createCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const name = parsed.data.name.trim();

  // Check if category already exists
  const existing = await prisma.category.findUnique({
    where: { name },
  });

  if (existing) {
    return { error: "A category with this name already exists", categoryId: existing.id };
  }

  const category = await prisma.category.create({
    data: {
      name,
      createdBy: Number(session.user.id),
    },
  });

  revalidatePath("/browse");
  revalidatePath("/categories");
  return { success: true, categoryId: category.id };
}
