import type { Metadata } from "next";

import UserByNameScreen from "@/features/users/user-by-name-screen";

export const metadata: Metadata = { title: "Profile" };

export default async function Page({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return <UserByNameScreen name={name} />;
}
