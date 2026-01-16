"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { Loader2, ShieldAlert } from "lucide-react";

interface Props {
  children: React.ReactNode;
  requiredPermission?: string;
}

export default function ProtectedRoute({ children, requiredPermission }: Props) {
  const { hasPermission, loading } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!loading && requiredPermission && !hasPermission(requiredPermission)) {
      // Redirect if they don't have access
      router.push("/dashboard?error=unauthorized");
    }
  }, [loading, hasPermission, requiredPermission, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <ShieldAlert size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-black uppercase italic">Access Denied</h1>
        <p className="text-slate-500">You do not have the required permissions to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}