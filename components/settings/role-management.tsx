"use client"

import { useState } from "react"
import { useOrganization } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { updateUserRole } from "@/lib/clerk-helpers"

// Define available roles
const ROLES = [
  { id: "admin", name: "Administrator", description: "Full access to all features" },
  { id: "manager", name: "Manager", description: "Can manage bookings and clients" },
  { id: "staff", name: "Staff", description: "Can view and update assigned bookings" },
  { id: "user", name: "User", description: "Basic access" },
]

export function RoleManagement() {
  const { organization, isLoaded } = useOrganization()
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const { toast } = useToast()

  if (!isLoaded || !organization) {
    return <div>Loading...</div>
  }

  const members = organization.memberships || []

  async function handleRoleChange(userId: string, role: string) {
    try {
      setUpdatingUserId(userId)

      // Update the user's role in Clerk
      await updateUserRole(userId, role)

      toast({
        title: "Role updated",
        description: "The user's role has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdatingUserId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Management</CardTitle>
        <CardDescription>Manage user roles and permissions within your organization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => {
            const userId = member.publicUserData?.userId || ""
            const currentRole = (member.publicUserData?.publicMetadata?.role as string) || "user"
            const isUpdating = updatingUserId === userId

            return (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.publicUserData?.imageUrl || ""} />
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
                  {isUpdating ? (
                    <Button variant="ghost" size="sm" disabled>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </Button>
                  ) : (
                    <Select defaultValue={currentRole} onValueChange={(value) => handleRoleChange(userId, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
