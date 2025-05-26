import { RoleManagement } from "@/components/settings/role-management"
import { OrganizationAdminContent } from "@/components/auth/protected-content"
import { redirect } from "next/navigation"

export default function RolesPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Role Management</h1>

      <OrganizationAdminContent fallback={redirect("/access-denied")}>
        <RoleManagement />
      </OrganizationAdminContent>
    </div>
  )
}
