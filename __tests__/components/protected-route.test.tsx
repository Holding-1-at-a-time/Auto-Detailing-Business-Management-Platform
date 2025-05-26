import { screen } from "@testing-library/react"
import { renderWithAuth } from "../utils/auth-test-utils"
import { ProtectedRoute } from "@/components/layout/protected-route"

// Mock router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe("ProtectedRoute", () => {
  it("renders children when user is authenticated", () => {
    renderWithAuth(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>,
    )

    expect(screen.getByTestId("protected-content")).toBeInTheDocument()
  })

  it("renders children when user has required role", () => {
    renderWithAuth(
      <ProtectedRoute requiredRole="admin">
        <div data-testid="admin-content">Admin Content</div>
      </ProtectedRoute>,
    )

    expect(screen.getByTestId("admin-content")).toBeInTheDocument()
  })
})
