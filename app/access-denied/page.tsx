import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8">
          You don't have permission to access this tenant. Please contact the tenant administrator if you believe this
          is an error.
        </p>
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    </div>
  )
}
