import type { Metadata } from "next";

import EditProfileScreen from "@/features/auth/edit-profile-screen";
import { latestAdultBirthDate } from "@/features/auth/auth-validation";

export const metadata: Metadata = { title: "Edit profile" };

export default function Page() {
  return <EditProfileScreen maxBirthDate={latestAdultBirthDate()} />;
}
