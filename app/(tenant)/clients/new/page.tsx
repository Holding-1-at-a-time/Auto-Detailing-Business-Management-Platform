"use client"

import { requireTenantAccess } from "@/lib/auth"
import { ClientForm } from "@/components/clients/client-form"
import { createClient } from "@/lib/actions/client-actions"

interface NewClientPageProps {
  params: { tenant: string }
}

export default async function NewClientPage({ params }: NewClientPageProps) {
  // Server-side auth check
  await requireTenantAccess(params.tenant)

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">New Client</h1>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <ClientForm
            onSubmit={async (data) => {
              "use server"
              await createClient(params.tenant, data)
            }}
          />
        </div>
      </div>
    </div>
  )
}
