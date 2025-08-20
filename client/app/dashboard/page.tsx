"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleShopClick = (shopName: string) => {
    const currentHost = window.location.host;
    const baseHost = currentHost.includes("localhost")
      ? "localhost:3001"
      : currentHost.split(".").slice(-2).join(".");
    const protocol = window.location.protocol;

    // Get token from localStorage to pass to subdomain
    const token = localStorage.getItem("authToken");
    const tokenParam = token ? `?token=${encodeURIComponent(token)}` : "";

    const subdomainUrl = `${protocol}//${shopName.toLowerCase()}.${baseHost}${tokenParam}`;
    console.log(
      "🔗 Opening shop with token:",
      subdomainUrl.includes("token=") ? "Token included" : "No token"
    );
    window.open(subdomainUrl, "_blank");
  };

  const handleLogout = async () => {
    await logout();
    router.push("/signin");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header with profile dropdown */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Shop Management Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Logout Button */}
              <Button
                variant="outline"
                onClick={() => setShowLogoutDialog(true)}
                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Logout
              </Button>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.username}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.shops.length} shop
                        {user.shops.length !== 1 ? "s" : ""} registered
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Your Shops
                  </DropdownMenuLabel>

                  {user.shops.map((shop) => (
                    <DropdownMenuItem
                      key={shop.id}
                      className="cursor-pointer"
                      onClick={() => handleShopClick(shop.name)}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>{shop.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => setShowLogoutDialog(true)}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Welcome card */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-2xl">
                Welcome back, {user.username}!
              </CardTitle>
              <CardDescription>
                Manage your {user.shops.length} registered shops from this
                dashboard.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Shop cards */}
          {user.shops.map((shop) => (
            <Card
              key={shop.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleShopClick(shop.name)}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>{shop.name}</span>
                </CardTitle>
                <CardDescription>
                  Click to access your shop dashboard
                  <br />
                  <span className="text-xs text-muted-foreground">
                    Created {new Date(shop.createdAt).toLocaleDateString()}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full bg-transparent">
                  Open Shop Dashboard
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Stats card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Shops:</span>
                  <span className="font-semibold">{user.shops.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Account Created:
                  </span>
                  <span className="font-semibold text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="font-semibold text-xs">
                    {user.id.slice(0, 8)}...
                  </span>
                </div>
              </div>

              {/* Quick Logout Button */}
              <div className="pt-2 border-t">
                <Button
                  variant="destructive"
                  onClick={() => setShowLogoutDialog(true)}
                  className="w-full"
                  size="sm"
                >
                  Logout from Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Logout confirmation dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout from your account?
              <br />
              <br />
              You will be signed out from:
              <br />
              • Main dashboard
              <br />• All shop subdomains ({user?.shops.length} shops)
              <br />
              <br />
              You'll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowLogoutDialog(false);
                handleLogout();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
