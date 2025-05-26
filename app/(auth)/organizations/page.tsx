import { OrganizationList } from "@/components/organizations/organization-list"

export default function OrganizationsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Your Organizations</h1>
      <OrganizationList />
    </div>
  )
}
