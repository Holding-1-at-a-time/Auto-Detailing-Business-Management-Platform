"use client"

import { useOrganizationList, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { Loader2, Plus } from "lucide-react"

export function OrganizationList() {
  const { organizationList, isLoaded, setActive } = useOrganizationList()
  const { user } = useUser()
  const router = useRouter()

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  async function handleSelectOrganization(organizationId: string) {
    await setActive({ organization: organizationId })
    router.push("/dashboard")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Organizations</CardTitle>
        <CardDescription>Select an organization to manage or create a new one</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {organizationList.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">You don't have any organizations yet.</div>
          ) : (
            organizationList.map((org) => (
              <div
                key={org.organization.id}
                className="flex items-center justify-between p-4 border rounded-md hover:bg-accent cursor-pointer"
                onClick={() => handleSelectOrganization(org.organization.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={org.organization.imageUrl || "/placeholder.svg"} />
                    <AvatarFallback>{org.organization.name?.[0] || "O"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{org.organization.name}</p>
                    <p className="text-sm text-muted-foreground">{org.membership.role.replace("_", " ")}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => router.push("/create-organization")} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create New Organization
        </Button>
      </CardFooter>
    </Card>
  )
}
