"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Id } from "@/convex/_generated/dataModel"

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  popular?: boolean
}

interface ServiceSelectorProps {
  tenantId: Id<"tenants">
  selectedService: string
  onServiceSelect: (service: string) => void
}

// This would typically come from your database
const services: Service[] = [
  {
    id: "basic-wash",
    name: "Basic Wash",
    description: "Exterior wash, tire cleaning, and basic interior vacuum",
    duration: 30,
    price: 29.99,
  },
  {
    id: "interior-detail",
    name: "Interior Detailing",
    description: "Deep cleaning of all interior surfaces, carpet shampooing, and leather conditioning",
    duration: 60,
    price: 89.99,
  },
  {
    id: "exterior-detail",
    name: "Exterior Detailing",
    description: "Thorough exterior cleaning, clay bar treatment, and wax application",
    duration: 60,
    price: 99.99,
  },
  {
    id: "full-detail",
    name: "Full Detailing",
    description: "Complete interior and exterior detailing package",
    duration: 120,
    price: 179.99,
    popular: true,
  },
  {
    id: "ceramic-coating",
    name: "Ceramic Coating",
    description: "Professional ceramic coating application for long-lasting protection",
    duration: 120,
    price: 299.99,
  },
  {
    id: "paint-correction",
    name: "Paint Correction",
    description: "Professional paint correction to remove scratches, swirls, and imperfections",
    duration: 180,
    price: 349.99,
  },
]

export function ServiceSelector({ tenantId, selectedService, onServiceSelect }: ServiceSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => (
        <Card
          key={service.id}
          className={cn(
            "relative cursor-pointer transition-all hover:shadow-lg",
            selectedService === service.name ? "ring-2 ring-primary border-primary" : "hover:border-primary/50",
          )}
          onClick={() => onServiceSelect(service.name)}
        >
          {service.popular && <Badge className="absolute -top-2 -right-2 bg-orange-500">Most Popular</Badge>}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{service.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{service.duration} min</span>
              </div>
              <div className="flex items-center gap-1 font-semibold">
                <DollarSign className="h-4 w-4" />
                <span>{service.price}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
