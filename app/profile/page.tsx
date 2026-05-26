import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch user data from API
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/user/profile`, {
    headers: {
      Cookie: `next-auth.session-token=${session.sessionToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Failed to fetch profile:", await response.text());
    redirect("/login");
  }

  const userData = await response.json();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Личный кабинет</h1>
        <ProfileClient initialData={userData} />
      </div>
    </div>
  );
}
