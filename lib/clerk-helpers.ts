import { clerkClient } from "@clerk/nextjs/server"
import { auth } from "@clerk/nextjs/server"

export async function getUserRole() {
  const { userId } = auth()

  if (!userId) {
    return null
  }

  const user = await clerkClient.users.getUser(userId)
  return user.publicMetadata.role as string | undefined
}

export async function isUserAdmin() {
  const role = await getUserRole()
  return role === "admin" || role === "owner"
}

export async function updateUserRole(userId: string, role: string) {
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
      role,
    },
  })
}

export async function getUserOrganizations(userId: string) {
  const user = await clerkClient.users.getUser(userId)
  return user.organizationMemberships
}

export async function getOrganizationMembers(organizationId: string) {
  const members = await clerkClient.organizations.getOrganizationMembershipList({
    organizationId,
  })

  return members
}

export async function inviteToOrganization(organizationId: string, emailAddress: string, role: string) {
  await clerkClient.organizations.createOrganizationInvitation({
    organizationId,
    emailAddress,
    role,
  })
}
