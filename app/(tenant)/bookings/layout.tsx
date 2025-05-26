import type React from "react"
import Link from "next/link"
import { Suspense } from "react"
import { ChevronRight, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { requireTenantAccess } from "@/lib/auth"

interface BookingsLayoutProps {
  children: React.ReactNode
  params: { tenant: string }
}

export default async function BookingsLayout({ children, params }: BookingsLayoutProps) {
  // Server-side auth check
  await requireTenantAccess(params.tenant)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href={`/${params.tenant}/dashboard`} className="hover:text-foreground">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Bookings</span>
        </div>
        <Button asChild size="sm">
          <Link href={`/${params.tenant}/bookings/new`}>
            <Plus className="mr-1 h-4 w-4" />
            New Booking
          </Link>
        </Button>
      </div>

      <Suspense fallback={<BookingsLayoutSkeleton />}>{children}</Suspense>
    </div>
  )
}

function BookingsLayoutSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}
