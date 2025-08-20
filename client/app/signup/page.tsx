"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/loading-spinner"
import Link from "next/link"

export default function SignUpPage() {
  const router = useRouter()
  const { signup, isAuthenticated, isLoading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    shopNames: ["", "", ""],
  })
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleShopNameChange = (index: number, value: string) => {
    const newShopNames = [...formData.shopNames]
    newShopNames[index] = value
    setFormData({ ...formData, shopNames: newShopNames })
  }

  const addShopName = () => {
    setFormData({
      ...formData,
      shopNames: [...formData.shopNames, ""],
    })
  }

  const removeShopName = (index: number) => {
    if (formData.shopNames.length > 3) {
      const newShopNames = formData.shopNames.filter((_, i) => i !== index)
      setFormData({ ...formData, shopNames: newShopNames })
    }
  }

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors([])

    const filteredShopNames = formData.shopNames.filter((name) => name.trim())

    const result = await signup(formData.username, formData.password, filteredShopNames)

    if (result.success) {
      router.push("/signin?message=Account created successfully! Please sign in.")
    } else {
      setErrors(result.errors)
    }

    setIsLoading(false)
  }

  // Show loading if checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Create Account</CardTitle>
          <CardDescription>Join our multi-shop management platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                required
              />
              <p className="text-sm text-muted-foreground">
                Must be at least 8 characters with one number and one special character
              </p>
            </div>

            <div className="space-y-2">
              <Label>Shop Names (minimum 3 required)</Label>
              {formData.shopNames.map((shopName, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="text"
                    value={shopName}
                    onChange={(e) => handleShopNameChange(index, e.target.value)}
                    placeholder={`Shop name ${index + 1}`}
                    required={index < 3}
                  />
                  {formData.shopNames.length > 3 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => removeShopName(index)}>
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addShopName} className="w-full bg-transparent">
                Add Another Shop
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <LoadingSpinner className="mr-2" /> : null}
              Create Account
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
