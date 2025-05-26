import { notFound } from "next/navigation"
import Link from "next/link"
import { getTenantBySlug } from "@/lib/actions/tenant-actions"
import { ClientBookingLayout } from "@/components/client/client-booking-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, DollarSign, Car, Sparkles, Shield, Droplet, Brush, SprayCan } from "lucide-react"

interface ServicesPageProps {
  params: { tenant: string }
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  const tenant = await getTenantBySlug(params.tenant)

  if (!tenant) {
    notFound()
  }

  const services = [
    {
      id: "basic-wash",
      name: "Basic Wash",
      description: "Exterior wash, tire cleaning, and basic interior vacuum.",
      duration: "30 min",
      price: "$29.99",
      icon: Droplet,
      features: [
        "Exterior hand wash",
        "Wheel cleaning",
        "Tire dressing",
        "Basic interior vacuum",
        "Dashboard wipe-down",
      ],
    },
    {
      id: "interior-detailing",
      name: "Interior Detailing",
      description: "Deep cleaning of all interior surfaces, carpet shampooing, and leather conditioning.",
      duration: "1 hour",
      price: "$89.99",
      icon: Brush,
      features: [
        "Complete interior vacuum",
        "Carpet shampooing",
        "Leather cleaning and conditioning",
        "Dashboard and console detailing",
        "Window cleaning (interior)",
        "Odor elimination",
      ],
    },
    {
      id: "exterior-detailing",
      name: "Exterior Detailing",
      description: "Thorough exterior cleaning, clay bar treatment, and wax application.",
      duration: "1 hour",
      price: "$99.99",
      icon: SprayCan,
      features: [
        "Premium hand wash",
        "Clay bar treatment",
        "Paint decontamination",
        "Wax application",
        "Wheel deep cleaning",
        "Tire dressing",
        "Exterior trim restoration",
      ],
    },
    {
      id: "full-detailing",
      name: "Full Detailing",
      description: "Complete interior and exterior detailing package.",
      duration: "2 hours",
      price: "$179.99",
      icon: Sparkles,
      features: [
        "All Interior Detailing services",
        "All Exterior Detailing services",
        "Engine bay cleaning",
        "Headlight restoration",
        "Premium carnauba wax",
      ],
    },
    {
      id: "ceramic-coating",
      name: "Ceramic Coating",
      description: "Professional ceramic coating application for long-lasting protection.",
      duration: "2 hours",
      price: "$299.99",
      icon: Shield,
      features: [
        "Full paint correction",
        "Surface preparation",
        "Professional-grade ceramic coating",
        "Up to 12 months protection",
        "Hydrophobic properties",
        "UV protection",
      ],
    },
    {
      id: "paint-correction",
      name: "Paint Correction",
      description: "Professional paint correction to remove scratches, swirls, and imperfections.",
      duration: "3 hours",
      price: "$349.99",
      icon: Car,
      features: [
        "Multi-stage paint correction",
        "Swirl removal",
        "Scratch reduction",
        "Water spot removal",
        "Paint enhancement",
        "Final polish",
      ],
    },
  ]

  return (
    <ClientBookingLayout tenant={tenant}>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional auto detailing services tailored to your vehicle's needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-primary/10 text-primary">
                    <service.icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{service.name}</CardTitle>
                </div>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{service.duration}</span>
                  </div>
                  <div className="flex items-center font-medium">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>{service.price}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Includes:</p>
                  <ul className="text-sm space-y-1">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-primary">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/${params.tenant}/book?service=${service.name}`}>Book This Service</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Not Sure Which Service You Need?</h2>
          <p className="text-muted-foreground mb-6">
            Our AI booking assistant can help recommend the right service based on your vehicle's condition.
          </p>
          <Button asChild size="lg">
            <Link href={`/${params.tenant}/book?method=agent`}>Chat with Our AI Assistant</Link>
          </Button>
        </div>
      </div>
    </ClientBookingLayout>
  )
}
