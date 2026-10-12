import { AuthLayout } from "@/features/auth/auth-layout";
import { FormSkeleton } from "@/components/skeletons";

export default function Loading() { return <AuthLayout signup><div className="auth-card"><FormSkeleton /></div></AuthLayout>; }
