import { requireTenantAccess } from "@/lib/auth"
import { getClientById } from "@/lib/actions/client-actions"
import { EnhancedClientForm } from "@/components/clients/enhanced-client-form"
import { Card, CardContent } from "@/components/ui/card"
import { notFound } from "next/navigation"

interface EditClientPageProps {
  params: { tenant: string; clientId: string }
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  // Server-side auth check
  await requireTenantAccess(params.tenant)

  const client = await getClientById(params.tenant, params.clientId)

  if (!client) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Edit Client</h2>
      <Card>
        <CardContent className="pt-6">
          <EnhancedClientForm client={client} tenantId={params.tenant} />
        </CardContent>
      </Card>
    </div>
  )
}
