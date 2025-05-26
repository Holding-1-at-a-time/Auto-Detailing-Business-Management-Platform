"use client"

import type React from "react"

import { useState } from "react"
import { useOrganization, useOrganizationList } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { OrganizationAdminContent } from "@/components/auth/protected-content"
import { inviteToOrganization } from "@/lib/clerk-helpers"

export default function MembersPage() {
  const { organization, isLoaded } = useOrganization()
  const { userMemberships } = useOrganizationList({ userMemberships: true })

  const [email, setEmail] = useState("")
  const [role, setRole] = useState("basic_member")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()

    if (!organization) return

    setIsSubmitting(true)

    try {
      await inviteToOrganization(organization.id, email, role)
      setEmail("")
      setRole("basic_member")
    } catch (error) {
      console.error("Failed to invite member:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  const members = organization?.memberships || []
  const pendingInvitations = organization?.pendingInvitations || []

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Team Members</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Members</CardTitle>
            <CardDescription>Manage your team members and their roles.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded-md border">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.publicUserData?.imageUrl || "/placeholder.svg"} />
                      <AvatarFallback>
                        {member.publicUserData?.firstName?.[0] || ""}
                        {member.publicUserData?.lastName?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.publicUserData?.firstName} {member.publicUserData?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{member.publicUserData?.identifier}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm capitalize">{member.role.replace("_", " ")}</span>

                    <OrganizationAdminContent>
                      <Select disabled={member.role === "admin"}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Change role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="basic_member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    </OrganizationAdminContent>
                  </div>
                </div>
              ))}

              {pendingInvitations.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Pending Invitations</h3>
                  {pendingInvitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-2 rounded-md border bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{invitation.emailAddress}</p>
                        <p className="text-sm text-muted-foreground">Invited as {invitation.role.replace("_", " ")}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <OrganizationAdminContent>
          <Card>
            <CardHeader>
              <CardTitle>Invite New Member</CardTitle>
              <CardDescription>Send an invitation to join your organization.</CardDescription>
            </CardHeader>
            <form onSubmit={handleInvite}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="basic_member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending invitation..." : "Send Invitation"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </OrganizationAdminContent>
      </div>
    </div>
  )
}
