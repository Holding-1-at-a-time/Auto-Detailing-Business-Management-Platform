import { CreateOrganization } from "@clerk/nextjs"
import { dark } from "@clerk/themes"

export default function CreateOrganizationPage() {
  return (
    <div className="container mx-auto py-10">
      <CreateOrganization
        appearance={{
          baseTheme: dark,
          elements: {
            card: "shadow-none",
            navbar: "hidden",
            rootBox: "mx-auto max-w-3xl",
          },
        }}
        path="/create-organization"
      />
    </div>
  )
}
