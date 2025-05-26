import { UserProfile } from "@clerk/nextjs"
import { dark } from "@clerk/themes"

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
      />
    </div>
  )
}
