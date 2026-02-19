"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { deleteFromR2 } from "@/lib/r2";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const itemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().positive("Price must be positive").optional(),
  categoryId: z.coerce.number().int().positive(),
  imageUrls: z.array(z.string().url()).min(1, "At least one image is required"),
});

export async function createItem(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const imageUrls = JSON.parse(
    (formData.get("imageUrls") as string) || "[]"
  );

  const priceStr = formData.get("price") as string;
  const parsed = itemSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    price: priceStr ? Number(priceStr) : undefined,
    categoryId: formData.get("categoryId"),
    imageUrls,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { title, description, price, categoryId } = parsed.data;

  const item = await prisma.item.create({
    data: {
      title,
      description: description || null,
      price: price ?? null,
      categoryId,
      sellerId: Number(session.user.id),
      images: {
        create: parsed.data.imageUrls.map((url, i) => ({
          url,
          isPrimary: i === 0,
        })),
      },
    },
  });

  revalidatePath("/browse");
  revalidatePath("/my-items");
  return { success: true, itemId: item.id };
}

export async function updateItem(itemId: number, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item || item.sellerId !== Number(session.user.id)) {
    return { error: "Not authorized" };
  }

  const priceStr = formData.get("price") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const categoryId = Number(formData.get("categoryId"));

  if (!title) return { error: "Title is required" };

  await prisma.item.update({
    where: { id: itemId },
    data: {
      title,
      description: description || null,
      price: priceStr ? Number(priceStr) : null,
      categoryId,
    },
  });

  revalidatePath(`/items/${itemId}`);
  revalidatePath("/browse");
  revalidatePath("/my-items");
  return { success: true };
}

export async function deleteItem(itemId: number) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { images: true },
  });

  if (!item || item.sellerId !== Number(session.user.id)) {
    return { error: "Not authorized" };
  }

  // Delete images from R2
  for (const image of item.images) {
    try {
      await deleteFromR2(image.url);
    } catch {
      // Continue even if R2 delete fails
    }
  }

  await prisma.item.delete({ where: { id: itemId } });

  revalidatePath("/browse");
  revalidatePath("/my-items");
  return { success: true };
}

export async function updateItemStatus(
  itemId: number,
  status: "active" | "sold" | "withdrawn"
) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item || item.sellerId !== Number(session.user.id)) {
    return { error: "Not authorized" };
  }

  await prisma.item.update({
    where: { id: itemId },
    data: { status },
  });

  revalidatePath(`/items/${itemId}`);
  revalidatePath("/browse");
  revalidatePath("/my-items");
  return { success: true };
}
