"use client"

interface BookingHeaderProps {
  tenant: {
    name: string
    logoUrl?: string
  }
}

export function BookingHeader({ tenant }: BookingHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {tenant.logoUrl ? (
              <img src={tenant.logoUrl || "/placeholder.svg"} alt={tenant.name} className="h-12 w-auto" />
            ) : (
              <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">{tenant.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
              <p className="text-sm text-gray-600">Book Your Auto Detailing Service</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
