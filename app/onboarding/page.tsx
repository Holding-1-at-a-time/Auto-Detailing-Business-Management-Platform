"use client"

import type React from "react"

import { useState } from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/convex/_generated/api"
import { useConvex } from "convex/react"

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const convex = useConvex()
  const { session } = useClerk()

  const [companyName, setCompanyName] = useState("")
  const [role, setRole] = useState("owner")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!isLoaded || !user) return

    setIsSubmitting(true)

    try {
      // 1. Update user metadata with role
      await user.update({
        unsafeMetadata: {
          companyName,
          role,
        },
      })

      // 2. Create organization in Clerk
      const organization = await session?.createOrganization({ name: companyName })

      if (organization) {
        // 3. Create tenant in Convex
        const tenantId = await convex.mutation(api.tenants.createTenant, {
          name: companyName,
          slug: companyName.toLowerCase().replace(/\s+/g, "-"),
          ownerId: user.id,
        })

        // 4. Associate user with tenant in Convex
        await convex.mutation(api.users.addTenantToUser, {
          userId: user.id,
          tenantId,
        })

        // 5. Redirect to dashboard
        router.push(`/dashboard`)
      }
    } catch (error) {
      console.error("Onboarding error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-10 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>Tell us about your business to get started with Auto-Detailing Management.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Auto Detailing"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Your Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Setting up your account..." : "Complete Setup"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
