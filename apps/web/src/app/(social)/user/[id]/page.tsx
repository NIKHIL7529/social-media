import type { Metadata } from "next";

import PublicUserScreen from "@/features/users/public-user-screen";

export const metadata: Metadata = { title: "Profile" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PublicUserScreen id={id} />;
}
