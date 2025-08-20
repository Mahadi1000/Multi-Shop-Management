"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSubdomain, checkSubdomainShop, type Shop } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/loading-spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SubdomainHandlerProps {
  children: React.ReactNode;
}

export function SubdomainHandler({ children }: SubdomainHandlerProps) {
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(true);
  const [shop, setShop] = useState<Shop | null>(null);
  const [isSubdomain, setIsSubdomain] = useState(false);
  const [initialAuthCheck, setInitialAuthCheck] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Debug localStorage on subdomain
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("authToken");
      console.log("🔍 Subdomain localStorage check:", {
        hasToken: !!storedToken,
        tokenPreview: storedToken
          ? storedToken.substring(0, 20) + "..."
          : "none",
        hostname: window.location.hostname,
        href: window.location.href,
      });
    }
  }, []);

  useEffect(() => {
    const checkSubdomain = async () => {
      const subdomain = getSubdomain();

      if (!subdomain) {
        // No subdomain, render normal app
        setIsCheckingSubdomain(false);
        setIsSubdomain(false);
        return;
      }

      // We're on a subdomain
      setIsSubdomain(true);

      try {
        const shopData = await checkSubdomainShop();
        if (shopData) {
          setShop(shopData);
        } else {
          // Subdomain doesn't correspond to a valid shop
          setShop(null);
        }
      } catch (error) {
        console.error("Error checking subdomain shop:", error);
        setShop(null);
      } finally {
        setIsCheckingSubdomain(false);
      }
    };

    checkSubdomain();
  }, []);

  // Give authentication extra time to initialize on subdomains
  useEffect(() => {
    if (!authLoading) {
      // Add a small delay to ensure auth has fully initialized
      const timer = setTimeout(() => {
        setInitialAuthCheck(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  if (isCheckingSubdomain || authLoading || !initialAuthCheck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-muted-foreground">
            {isCheckingSubdomain
              ? "Checking shop..."
              : !initialAuthCheck
              ? "Initializing authentication..."
              : "Loading authentication..."}
          </p>
          <p className="text-xs text-muted-foreground">
            Auth: {isAuthenticated ? "true" : "false"} | Loading:{" "}
            {authLoading ? "true" : "false"} | InitialCheck:{" "}
            {initialAuthCheck ? "true" : "false"}
          </p>
        </div>
      </div>
    );
  }

  // If we're on a subdomain
  if (isSubdomain) {
    if (shop) {
      // Add debug logging for subdomain authentication
      console.log("🔍 Subdomain Auth Check:", {
        isAuthenticated,
        hasUser: !!user,
        authLoading,
        shopName: shop.name,
        userShops: user?.shops?.length || 0,
      });

      // Check if user is authenticated
      if (!isAuthenticated) {
        console.log("❌ Not authenticated on subdomain, showing auth required");

        // Check if we have a localStorage token that might need more time to verify
        if (typeof window !== "undefined") {
          const storedToken = localStorage.getItem("authToken");
          console.log("🔍 Token check for auth required:", {
            hasToken: !!storedToken,
            authLoading,
            isAuthenticated,
          });
        }

        // Not authenticated on subdomain
        return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <CardTitle>Authentication Required</CardTitle>
                <CardDescription>
                  Please sign in to access {shop.name} shop dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  You need to be signed in to access this shop.
                </p>
                <Button
                  onClick={() => {
                    const mainUrl =
                      window.location.protocol +
                      "//" +
                      (window.location.host.includes("localhost")
                        ? "localhost:3001"
                        : window.location.host.split(".").slice(-2).join("."));

                    // Create a return URL without any existing token params
                    const cleanReturnUrl =
                      window.location.protocol +
                      "//" +
                      window.location.host +
                      window.location.pathname;

                    window.location.href = `${mainUrl}/signin?redirect=${encodeURIComponent(
                      cleanReturnUrl
                    )}`;
                  }}
                  className="w-full"
                >
                  Sign In
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      }

      // Check if user owns this shop
      const userOwnsShop = user?.shops.some(
        (userShop) => userShop.name === shop.name
      );

      console.log("✅ Authenticated on subdomain, showing shop dashboard:", {
        username: user?.username,
        userOwnsShop,
        shopName: shop.name,
      });

      // Valid shop subdomain with authenticated user
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center space-y-8">
              {/* Shop Header */}
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary rounded-full mx-auto flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {shop.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-foreground">
                  Welcome to {shop.name}
                </h1>
                <p className="text-xl text-muted-foreground">
                  {userOwnsShop
                    ? "Your Shop Dashboard"
                    : `Visiting ${shop.name} shop`}
                </p>
              </div>

              {/* User Info */}
              {isAuthenticated && (
                <Card className="mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Welcome, {user?.username}!</span>
                    </CardTitle>
                    <CardDescription>
                      {userOwnsShop
                        ? "You are the owner of this shop"
                        : "You are visiting this shop"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Shop Name</p>
                        <p className="font-semibold">{shop.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Owner</p>
                        <p className="font-semibold">{shop.ownerUsername}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p className="font-semibold">
                          {new Date(shop.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      <Button
                        onClick={() => {
                          const mainUrl =
                            window.location.protocol +
                            "//" +
                            (window.location.host.includes("localhost")
                              ? "localhost:3001"
                              : window.location.host
                                  .split(".")
                                  .slice(-2)
                                  .join("."));
                          window.location.href = `${mainUrl}/dashboard`;
                        }}
                        className="w-full"
                      >
                        Go to Main Dashboard
                      </Button>
                      {userOwnsShop && (
                        <Button variant="outline" className="w-full">
                          Manage Shop Settings
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Info */}
              <div className="text-sm text-muted-foreground">
                <p>This is the subdomain for {shop.name} shop.</p>
                {userOwnsShop ? (
                  <p>Shop management features coming soon!</p>
                ) : (
                  <p>
                    Contact {shop.ownerUsername} for more information about this
                    shop.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Invalid shop subdomain
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-destructive">Shop Not Found</CardTitle>
              <CardDescription>
                The shop '{getSubdomain()}' does not exist or is not available.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                This subdomain does not correspond to a valid shop in our
                system.
              </p>
              <Button
                onClick={() => {
                  const mainUrl =
                    window.location.protocol +
                    "//" +
                    (window.location.host.includes("localhost")
                      ? "localhost:3001"
                      : window.location.host.split(".").slice(-2).join("."));
                  window.location.href = mainUrl;
                }}
                className="w-full"
              >
                Go to Main Platform
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Not on a subdomain, render normal app
  return <>{children}</>;
}
