"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function DashboardRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else {
        // Route based on role with proper mapping
        const roleMap: Record<string, string> = {
          "user": "/dashboard/user",
          "organizer": "/dashboard/organizer",
          "admin": "/dashboard/admin"
        };
        
        const role = user.role?.toLowerCase() || "";
        const dashboardPath = roleMap[role] || "/login";
        
        console.log(`Routing user with role "${user.role}" to ${dashboardPath}`);
        router.push(dashboardPath);
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
