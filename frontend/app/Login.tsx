"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to user login page - users choose between user/admin on the actual login pages
    router.push("/login/user");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-white">Redirecting...</p>
    </div>
  );
}
