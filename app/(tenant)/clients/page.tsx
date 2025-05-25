import { requireTenantAccess } from "@/lib/auth"
import { ClientList } from "@/components/clients/client-list"

interface ClientsPageProps {
  params: { tenant: string }
}

export default async function ClientsPage({ params }: ClientsPageProps) {
  // Server-side auth check
  await requireTenantAccess(params.tenant)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Clients</h1>
      <ClientList />
    </div>
  )
}
