"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function EnhancedProfile() {
  const { user, isLoaded } = useUser()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [bio, setBio] = useState("")

  // Initialize form values when user data is loaded
  useState(() => {
    if (isLoaded && user) {
      setFirstName(user.firstName || "")
      setLastName(user.lastName || "")
      setPhoneNumber((user.unsafeMetadata.phoneNumber as string) || "")
      setJobTitle((user.unsafeMetadata.jobTitle as string) || "")
      setBio((user.unsafeMetadata.bio as string) || "")
    }
  })

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>You need to be signed in to view your profile.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()

    try {
      setIsUpdating(true)

      // Update user data in Clerk
      await user.update({
        firstName,
        lastName,
        unsafeMetadata: {
          ...user.unsafeMetadata,
          phoneNumber,
          jobTitle,
          bio,
          lastUpdated: new Date().toISOString(),
        },
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error updating profile",
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
            <AvatarImage src={user.imageUrl || "/placeholder.svg"} />
            <AvatarFallback>
              {user.firstName?.[0] || ""}
              {user.lastName?.[0] || ""}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{user.fullName || "Your Profile"}</CardTitle>
            <CardDescription>{user.primaryEmailAddress?.emailAddress}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Owner / Manager"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a bit about yourself"
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
                  "Update Profile"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="account">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="flex items-center gap-2">
                  <Input value={user.primaryEmailAddress?.emailAddress || ""} disabled />
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "https://accounts.clerk.dev/user/settings/account")}
                  >
                    Manage
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <div className="flex items-center gap-2">
                  <Input type="password" value="••••••••" disabled />
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "https://accounts.clerk.dev/user/settings/account")}
                  >
                    Change
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Account Created</Label>
                <Input value={new Date(user.createdAt).toLocaleDateString()} disabled />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
