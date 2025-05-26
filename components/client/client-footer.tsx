import Link from "next/link"

interface ClientFooterProps {
  tenant: {
    id: string
    name: string
  }
}

export function ClientFooter({ tenant }: ClientFooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {year} {tenant.name}. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href={`/${tenant.id}/privacy`} className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href={`/${tenant.id}/terms`} className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
