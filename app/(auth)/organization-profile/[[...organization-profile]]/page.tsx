import { OrganizationProfile } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { BarChart, Car, Home } from "lucide-react"
import { ServiceManagement } from "@/components/organization/service-management"

export default function OrganizationProfilePage() {
  return (
    <div className="container mx-auto py-10">
      <OrganizationProfile
        appearance={{
          baseTheme: dark,
          elements: {
            card: "shadow-none",
            navbar: "hidden",
            rootBox: "mx-auto max-w-3xl",
          },
        }}
        path="/organization-profile"
      >
        {/* Custom pages for the OrganizationProfile */}
        <OrganizationProfile.Page label="Analytics" url="analytics" labelIcon={<BarChart className="w-4 h-4" />}>
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Business Analytics</h1>
            <p className="text-muted-foreground">View detailed analytics for your auto-detailing business.</p>
            {/* Analytics dashboard would be implemented here */}
            <div className="mt-4 p-4 border rounded-md">
              <p className="text-center text-muted-foreground">Business analytics will appear here.</p>
            </div>
          </div>
        </OrganizationProfile.Page>

        <OrganizationProfile.Page label="Services" url="services" labelIcon={<Car className="w-4 h-4" />}>
          <div className="p-4">
            <ServiceManagement />
          </div>
        </OrganizationProfile.Page>

        {/* Link to dashboard */}
        <OrganizationProfile.Link label="Dashboard" url="/dashboard" labelIcon={<Home className="w-4 h-4" />} />

        {/* Reordering default pages */}
        <OrganizationProfile.Page label="members" />
        <OrganizationProfile.Page label="general" />
      </OrganizationProfile>
    </div>
  )
}
