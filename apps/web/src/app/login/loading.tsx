import { AuthLayout } from "@/features/auth/auth-layout";
import { FormSkeleton } from "@/components/skeletons";

export default function Loading() { return <AuthLayout><div className="auth-card"><FormSkeleton fields={2} /></div></AuthLayout>; }
