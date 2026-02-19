"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const bidSchema = z.object({
  amount: z.coerce.number().positive("Bid amount must be positive"),
});

export async function placeBid(itemId: number, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const parsed = bidSchema.safeParse({
    amount: formData.get("amount"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Verify item exists and is active
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) return { error: "Item not found" };
  if (item.status !== "active") return { error: "This item is no longer available" };

  // Sellers cannot bid on their own items
  if (item.sellerId === Number(session.user.id)) {
    return { error: "You cannot bid on your own item" };
  }

  await prisma.bid.create({
    data: {
      itemId,
      bidderId: Number(session.user.id),
      amount: parsed.data.amount,
    },
  });

  revalidatePath(`/items/${itemId}`);
  revalidatePath("/my-items");
  return { success: true };
}
