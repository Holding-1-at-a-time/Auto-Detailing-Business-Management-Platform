import { UserProfile } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { Car, Calendar, Home } from "lucide-react"
import { VehicleManagement } from "@/components/profile/vehicle-management"
import { BookingHistory } from "@/components/profile/booking-history"

export default function UserProfilePage() {
  return (
    <div className="container mx-auto py-10">
      <UserProfile
        appearance={{
          baseTheme: dark,
          elements: {
            card: "shadow-none",
            navbar: "hidden",
            rootBox: "mx-auto max-w-3xl",
          },
        }}
        path="/profile"
      >
        {/* Custom pages for the UserProfile */}
        <UserProfile.Page label="My Bookings" url="my-bookings" labelIcon={<Calendar className="w-4 h-4" />}>
          <div className="p-4">
            <BookingHistory />
          </div>
        </UserProfile.Page>

        <UserProfile.Page label="My Vehicles" url="my-vehicles" labelIcon={<Car className="w-4 h-4" />}>
          <div className="p-4">
            <VehicleManagement />
          </div>
        </UserProfile.Page>

        {/* Link to dashboard */}
        <UserProfile.Link label="Dashboard" url="/dashboard" labelIcon={<Home className="w-4 h-4" />} />

        {/* Reordering default pages */}
        <UserProfile.Page label="account" />
        <UserProfile.Page label="security" />
      </UserProfile>
    </div>
  )
}
