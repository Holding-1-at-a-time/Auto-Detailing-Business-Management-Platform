import { OrganizationList } from "@clerk/nextjs"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Organizations | Auto Detailing Platform",
  description: "Manage your auto detailing business organizations",
}

export default function OrganizationsPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-6xl p-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Your Organizations</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Select or create an organization to manage your auto detailing business
          </p>
        </div>
        <OrganizationList
          hidePersonal={true}
          afterCreateOrganizationUrl="/dashboard"
          afterSelectOrganizationUrl="/dashboard"
        />
      </div>
    </div>
  )
}
