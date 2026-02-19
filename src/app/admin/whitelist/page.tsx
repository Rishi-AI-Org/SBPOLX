import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import WhitelistManager from "@/components/WhitelistManager";

export const dynamic = "force-dynamic";

export default async function WhitelistPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/browse");

  const allowedEmails = await prisma.allowedEmail.findMany({
    orderBy: { email: "asc" },
  });

  const registeredEmails = await prisma.user.findMany({
    select: { email: true },
  });
  const registeredSet = new Set(registeredEmails.map((u) => u.email));

  const emailList = allowedEmails.map((ae) => ({
    email: ae.email,
    registered: registeredSet.has(ae.email),
    addedAt: ae.addedAt.toISOString(),
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Email Whitelist
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Only students with whitelisted emails can sign up. Total:{" "}
        {allowedEmails.length} emails, {registeredSet.size} registered.
      </p>

      <WhitelistManager emails={emailList} />
    </div>
  );
}
