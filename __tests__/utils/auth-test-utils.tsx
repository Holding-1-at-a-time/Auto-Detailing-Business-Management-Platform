import type React from "react"
import { render } from "@testing-library/react"
import { ClerkProvider } from "@clerk/nextjs"
import { RoleProvider } from "@/providers/RoleProvider"

// Mock Clerk
jest.mock("@clerk/nextjs", () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useUser: () => ({
    isLoaded: true,
    user: {
      id: "user_123",
      fullName: "Test User",
      primaryEmailAddress: { emailAddress: "test@example.com" },
      publicMetadata: { role: "admin" },
      unsafeMetadata: { phoneNumber: "123-456-7890" },
    },
  }),
  useOrganization: () => ({
    isLoaded: true,
    organization: {
      id: "org_123",
      name: "Test Organization",
      memberships: [],
      membersCount: 1,
    },
  }),
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
  }),
}))

// Custom render function with providers
function renderWithAuth(ui: React.ReactElement) {
  return render(
    <ClerkProvider>
      <RoleProvider>{ui}</RoleProvider>
    </ClerkProvider>,
  )
}

export * from "@testing-library/react"
export { renderWithAuth }
