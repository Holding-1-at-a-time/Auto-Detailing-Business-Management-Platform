import { requireTenantAccess } from "@/lib/auth"
import { getClientById } from "@/lib/actions/client-actions"
import { ClientDetails } from "@/components/clients/client-details"
import { notFound } from "next/navigation"

interface ClientDetailsPageProps {
  params: { tenant: string; clientId: string }
}

export default async function ClientDetailsPage({ params }: ClientDetailsPageProps) {
  // Server-side auth check
  await requireTenantAccess(params.tenant)

  const client = await getClientById(params.tenant, params.clientId)

  if (!client) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Client Details</h1>
      <ClientDetails client={client} />
    </div>
  )
}
