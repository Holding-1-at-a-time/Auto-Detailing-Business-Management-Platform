"use client"

import { UserButton as ClerkUserButton } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"

export function UserButton() {
  const router = useRouter()
  const { theme } = useTheme()

  return (
    <ClerkUserButton
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
        elements: {
          userButtonAvatarBox: "h-8 w-8",
        },
      }}
      afterSignOutUrl="/"
      userProfileUrl="/profile"
      userProfileMode="navigation"
    />
  )
}
