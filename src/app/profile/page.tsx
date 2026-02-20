import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: {
      displayName: true,
      email: true,
      phoneNumber: true,
      hostelNumber: true,
      roomNumber: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Profile</h1>
      <p className="text-sm text-gray-500 mb-8">
        Contact details you share here will be visible to other logged-in users
        on your listings so buyers can reach you directly.
      </p>
      <ProfileForm user={user} />
    </div>
  );
}
