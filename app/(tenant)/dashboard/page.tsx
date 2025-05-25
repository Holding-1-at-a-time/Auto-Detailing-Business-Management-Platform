import { requireTenantAccess } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AppointmentList } from "@/components/dashboard/appointment-list"
import { AnalyticsCard } from "@/components/dashboard/analytics-card"

interface DashboardPageProps {
  params: { tenant: string }
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  // Server-side auth check
  await requireTenantAccess(params.tenant)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <DashboardHeader tenantId={params.tenant} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnalyticsCard title="Monthly Revenue" value="$2,500" change="+12%" type="positive" />
        <AnalyticsCard title="New Clients" value="8" change="+5%" type="positive" />
        <AnalyticsCard title="Completed Services" value="24" change="-3%" type="negative" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
          <AppointmentList tenantId={params.tenant} limit={5} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <p className="text-muted-foreground">Activity feed coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
