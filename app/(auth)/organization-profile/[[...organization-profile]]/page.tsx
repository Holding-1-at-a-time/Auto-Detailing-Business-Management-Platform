import { OrganizationProfile } from "@clerk/nextjs"
import { dark } from "@clerk/themes"

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
      />
    </div>
  )
}
