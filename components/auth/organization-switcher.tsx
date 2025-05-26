"use client"

import { OrganizationSwitcher as ClerkOrganizationSwitcher } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"
import { BarChart, Car, Home } from "lucide-react"

export function OrganizationSwitcher() {
  const router = useRouter()
  const { theme } = useTheme()

  return (
    <ClerkOrganizationSwitcher
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
        elements: {
          organizationSwitcherTrigger:
            "py-2 px-4 flex justify-between items-center gap-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        },
      }}
      createOrganizationUrl="/create-organization"
      organizationProfileUrl="/organization-profile"
      afterCreateOrganizationUrl="/dashboard"
      afterSelectOrganizationUrl="/dashboard"
    >
      {/* Custom pages for the OrganizationProfile */}
      <ClerkOrganizationSwitcher.OrganizationProfilePage
        label="Analytics"
        url="analytics"
        labelIcon={<BarChart className="w-4 h-4" />}
      >
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Business Analytics</h1>
          <p className="text-muted-foreground">View detailed analytics for your auto-detailing business.</p>
          {/* Analytics dashboard would be implemented here */}
        </div>
      </ClerkOrganizationSwitcher.OrganizationProfilePage>

      <ClerkOrganizationSwitcher.OrganizationProfilePage
        label="Services"
        url="services"
        labelIcon={<Car className="w-4 h-4" />}
      >
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Service Management</h1>
          <p className="text-muted-foreground">Configure the auto-detailing services your business offers.</p>
          {/* Service management UI would be implemented here */}
        </div>
      </ClerkOrganizationSwitcher.OrganizationProfilePage>

      {/* Link to dashboard */}
      <ClerkOrganizationSwitcher.OrganizationProfileLink
        label="Dashboard"
        url="/dashboard"
        labelIcon={<Home className="w-4 h-4" />}
      />

      {/* Reordering default pages */}
      <ClerkOrganizationSwitcher.OrganizationProfilePage label="members" />
      <ClerkOrganizationSwitcher.OrganizationProfilePage label="general" />
    </ClerkOrganizationSwitcher>
  )
}
