import { notFound } from "next/navigation"
import Link from "next/link"
import { getTenantBySlug } from "@/lib/actions/tenant-actions"
import { ClientBookingLayout } from "@/components/client/client-booking-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarClock, Car, Sparkles, Shield, MessageSquare } from "lucide-react"

interface ClientHomePageProps {
  params: { tenant: string }
}

export default async function ClientHomePage({ params }: ClientHomePageProps) {
  const tenant = await getTenantBySlug(params.tenant)

  if (!tenant) {
    notFound()
  }

  return (
    <ClientBookingLayout tenant={tenant}>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{tenant.name}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Professional auto detailing services to keep your vehicle looking its best
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href={`/${params.tenant}/book`}>Book Appointment</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={`/${params.tenant}/services`}>View Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Basic Wash
                </CardTitle>
                <CardDescription>Quick and effective cleaning</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Exterior wash, tire cleaning, and basic interior vacuum.</p>
                <p className="font-bold mt-4">$29.99</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/${params.tenant}/book`}>Book Now</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Full Detailing
                </CardTitle>
                <CardDescription>Comprehensive cleaning inside and out</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Complete interior and exterior detailing package for a like-new finish.</p>
                <p className="font-bold mt-4">$179.99</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/${params.tenant}/book`}>Book Now</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Ceramic Coating
                </CardTitle>
                <CardDescription>Long-lasting protection</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Professional ceramic coating application for long-lasting protection.</p>
                <p className="font-bold mt-4">$299.99</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/${params.tenant}/book`}>Book Now</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href={`/${params.tenant}/services`}>View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Booking Options Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Easy Booking Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5" />
                  Calendar Booking
                </CardTitle>
                <CardDescription>Choose your preferred date and time</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Browse our availability calendar and select the perfect time slot for your appointment.</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/${params.tenant}/book?method=calendar`}>Book with Calendar</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  AI Assistant
                </CardTitle>
                <CardDescription>Chat with our booking assistant</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Simply tell our AI assistant when you'd like to book and what service you need. It's like texting a
                  friend!
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/${params.tenant}/book?method=agent`}>Book with AI</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3">
                    J
                  </div>
                  <div>
                    <p className="font-medium">John D.</p>
                    <p className="text-sm text-muted-foreground">Sedan Owner</p>
                  </div>
                </div>
                <p className="italic">
                  "My car looks brand new after the full detailing service. The team was professional and thorough.
                  Highly recommend!"
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3">
                    S
                  </div>
                  <div>
                    <p className="font-medium">Sarah M.</p>
                    <p className="text-sm text-muted-foreground">SUV Owner</p>
                  </div>
                </div>
                <p className="italic">
                  "The ceramic coating has kept my SUV looking amazing even after months. Worth every penny for the
                  protection and shine."
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3">
                    R
                  </div>
                  <div>
                    <p className="font-medium">Robert T.</p>
                    <p className="text-sm text-muted-foreground">Truck Owner</p>
                  </div>
                </div>
                <p className="italic">
                  "Booking was so easy with the AI assistant. I just typed what I needed and when, and everything was
                  set up perfectly."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make Your Vehicle Shine?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8 text-primary-foreground/80">
            Book your appointment today and experience the difference of professional auto detailing.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href={`/${params.tenant}/book`}>Book Your Appointment</Link>
          </Button>
        </div>
      </section>
    </ClientBookingLayout>
  )
}
