"use client"

import type React from "react"

import { useState } from "react"
import { useOrganization } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function EnhancedOrganizationProfile() {
  const { organization, isLoaded } = useOrganization()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")

  // Initialize form values when organization data is loaded
  useState(() => {
    if (isLoaded && organization) {
      setName(organization.name || "")
      setSlug(organization.slug || "")
      setDescription((organization.publicMetadata?.description as string) || "")
    }
  })

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!organization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization Profile</CardTitle>
          <CardDescription>You need to be in an organization to view its profile.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  async function handleUpdateOrganization(e: React.FormEvent) {
    e.preventDefault()

    try {
      setIsUpdating(true)

      // Update organization data in Clerk
      await organization.update({
        name,
        slug,
        publicMetadata: {
          ...organization.publicMetadata,
          description,
          lastUpdated: new Date().toISOString(),
        },
      })

      toast({
        title: "Organization updated",
        description: "Your organization has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error updating organization",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={organization.imageUrl || "/placeholder.svg"} />
            <AvatarFallback>{organization.name?.[0] || "O"}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{organization.name || "Organization Profile"}</CardTitle>
            <CardDescription>Manage your organization settings</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Organization Information</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <form onSubmit={handleUpdateOrganization} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Organization Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  This will be used in your organization's URL: example.com/{slug}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your organization"
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Organization"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Organization ID</Label>
                <Input value={organization.id} disabled />
              </div>

              <div className="space-y-2">
                <Label>Created At</Label>
                <Input value={new Date(organization.createdAt).toLocaleDateString()} disabled />
              </div>

              <div className="space-y-2">
                <Label>Members</Label>
                <Input value={organization.membersCount || 0} disabled />
              </div>

              <Button variant="outline" onClick={() => (window.location.href = "/settings/members")}>
                Manage Members
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
