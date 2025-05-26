import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TenantNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">Tenant Not Found</h1>
        <p className="text-muted-foreground mb-8">The tenant you're looking for doesn't exist or has been removed.</p>
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    </div>
  )
}
