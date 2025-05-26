import type React from "react"
import { requireTenantAccess } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

interface ClientsLayoutProps {
  children: React.ReactNode
  params: { tenant: string }
}

export default async function ClientsLayout({ children, params }: ClientsLayoutProps) {
  // Server-side auth check
  await requireTenantAccess(params.tenant)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={`/${params.tenant}/dashboard`} className="hover:text-foreground">
              Dashboard
            </Link>
            <span>/</span>
            <span>Clients</span>
          </div>
        </div>
        <Button asChild>
          <Link href={`/${params.tenant}/clients/new`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>
      {children}
    </div>
  )
}
