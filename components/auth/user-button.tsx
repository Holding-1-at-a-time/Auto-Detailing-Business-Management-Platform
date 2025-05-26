"use client"

import { UserButton as ClerkUserButton } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"
import { Calendar, Car, Settings, Home } from "lucide-react"
import { useAuth } from "@clerk/nextjs"

export function UserButton() {
  const router = useRouter()
  const { theme } = useTheme()
  const { has, isLoaded } = useAuth()

  // Check if user is an admin (would be implemented based on your permission system)
  const isAdmin = isLoaded ? has({ permission: "org:admin" }) : false

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
    >
      {/* Custom menu items */}
      <ClerkUserButton.MenuItems>
        {/* Dashboard link */}
        <ClerkUserButton.Link label="Dashboard" labelIcon={<Home className="w-4 h-4" />} href="/dashboard" />

        {/* My Bookings link */}
        <ClerkUserButton.Link
          label="My Bookings"
          labelIcon={<Calendar className="w-4 h-4" />}
          href="/profile/my-bookings"
        />

        {/* My Vehicles link */}
        <ClerkUserButton.Link label="My Vehicles" labelIcon={<Car className="w-4 h-4" />} href="/profile/my-vehicles" />

        {/* Admin Settings - only shown to admins */}
        {isAdmin && (
          <ClerkUserButton.Link label="Admin Settings" labelIcon={<Settings className="w-4 h-4" />} href="/settings" />
        )}

        {/* Reordering default items */}
        <ClerkUserButton.Action label="manageAccount" />
        <ClerkUserButton.Action label="signOut" />
      </ClerkUserButton.MenuItems>

      {/* Custom profile pages */}
      <ClerkUserButton.UserProfilePage
        label="My Bookings"
        url="my-bookings"
        labelIcon={<Calendar className="w-4 h-4" />}
      >
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
          <p className="text-muted-foreground">View and manage all your auto-detailing appointments.</p>
          {/* Booking list would be implemented here */}
        </div>
      </ClerkUserButton.UserProfilePage>

      <ClerkUserButton.UserProfilePage label="My Vehicles" url="my-vehicles" labelIcon={<Car className="w-4 h-4" />}>
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">My Vehicles</h1>
          <p className="text-muted-foreground">Manage your vehicle information for easier booking.</p>
          {/* Vehicle management UI would be implemented here */}
        </div>
      </ClerkUserButton.UserProfilePage>
    </ClerkUserButton>
  )
}
