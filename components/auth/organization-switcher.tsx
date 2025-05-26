"use client"

import { OrganizationSwitcher as ClerkOrganizationSwitcher } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"

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
    />
  )
}
