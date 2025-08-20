"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  if (!isAuthenticated) {
    router.push("/signin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1>Home Page. Welcome to the platform</h1>
        <p>This is the home page</p>
        <Button onClick={() => router.push("/dashboard")}>Dashboard</Button>
      </div>
    </div>
  );
}
