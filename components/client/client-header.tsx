import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface ClientHeaderProps {
  tenant: {
    id: string
    name: string
    logoUrl?: string
  }
}

export function ClientHeader({ tenant }: ClientHeaderProps) {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {tenant.logoUrl ? (
            <Image
              src={tenant.logoUrl || "/placeholder.svg"}
              alt={tenant.name}
              width={40}
              height={40}
              className="rounded-md"
            />
          ) : (
            <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold">
              {tenant.name.charAt(0)}
            </div>
          )}
          <span className="font-semibold text-lg">{tenant.name}</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href={`/${tenant.id}/services`} className="text-sm text-muted-foreground hover:text-foreground">
            Services
          </Link>
          <Link href={`/${tenant.id}/contact`} className="text-sm text-muted-foreground hover:text-foreground">
            Contact
          </Link>
          <Button asChild size="sm">
            <Link href={`/${tenant.id}/book`}>Book Now</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
