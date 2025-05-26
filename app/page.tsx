"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { ChevronRight, Check, Star, ArrowRight, Calendar, Users, BarChart3, Package, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const { scrollYProgress } = useScroll()
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)

  // Dynamic parallax effect
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.3], [1, 0.8, 0])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#121212] text-white overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-[#121212] z-[-2]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#121212] via-[#121212] to-[#00ae98]/10 z-[-1]"></div>
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-[#00ae98]/5 blur-[120px] rounded-full z-[-1]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#00ae98]/10 blur-[120px] rounded-full z-[-1]"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#121212]/80 backdrop-blur-md border-b border-[#707070]/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-[#00ae98] flex items-center justify-center">
              <span className="text-black font-bold text-xl">AD</span>
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-[#00ae98] to-[#00ffdd]">
              DetailSync
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-[#e0e0e0] hover:text-[#00ae98] transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-[#e0e0e0] hover:text-[#00ae98] transition-colors">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-[#e0e0e0] hover:text-[#00ae98] transition-colors">
              Testimonials
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-[#e0e0e0] hover:text-[#00ae98] hover:bg-[#00ae98]/10">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-[#00ae98] hover:bg-[#00ae98]/90 text-black font-medium shadow-[0_0_15px_rgba(0,174,152,0.5)]">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 md:pt-40 md:pb-32">
        <motion.div style={{ y, opacity }} className="absolute top-20 right-0 w-full h-full z-[-1] pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#00ae98]/5 blur-[100px] rounded-full"></div>
        </motion.div>

        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col gap-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ae98]/10 border border-[#00ae98]/20 w-fit">
                <span className="text-[#00ae98] text-sm font-medium">AI-Powered Management</span>
                <span className="flex h-2 w-2 rounded-full bg-[#00ae98] animate-pulse"></span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Streamline Your <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00ae98] to-[#00ffdd]">
                  Auto-Detailing Business
                </span>
              </h1>

              <p className="text-lg text-[#a0a0a0] max-w-lg">
                Manage bookings, clients, and operations with our all-in-one platform designed specifically for
                auto-detailing professionals.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Link href="/sign-up">
                  <Button className="bg-[#00ae98] hover:bg-[#00ae98]/90 text-black font-medium h-12 px-6 shadow-[0_0_15px_rgba(0,174,152,0.5)] w-full sm:w-auto">
                    Start Free Trial
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    variant="outline"
                    className="border-[#707070] text-white hover:bg-[#707070]/10 h-12 px-6 w-full sm:w-auto"
                  >
                    Explore Features
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#121212] bg-[#707070]"></div>
                  ))}
                </div>
                <p className="text-sm text-[#a0a0a0]">
                  <span className="text-white font-medium">500+</span> businesses trust DetailSync
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative z-10 rounded-xl overflow-hidden border border-[#707070]/20 shadow-[0_0_30px_rgba(0,174,152,0.2)]">
                <Image
                  src="/auto-detailing-dashboard.png"
                  alt="DetailSync Dashboard"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent opacity-40"></div>
              </div>

              {/* Floating elements */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="absolute -bottom-6 -left-6 bg-[#1a1a1a] p-4 rounded-lg border border-[#707070]/20 shadow-[0_0_20px_rgba(0,174,152,0.3)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00ae98]/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-[#00ae98]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Bookings Today</p>
                    <p className="text-xl font-bold">12</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute -top-6 -right-6 bg-[#1a1a1a] p-4 rounded-lg border border-[#707070]/20 shadow-[0_0_20px_rgba(0,174,152,0.3)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00ae98]/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-[#00ae98]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Active Clients</p>
                    <p className="text-xl font-bold">248</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-20 md:py-32 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#707070]/50 to-transparent"></div>

        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Powerful Features for Auto-Detailing Professionals
              </h2>
              <p className="text-[#a0a0a0] text-lg">
                Everything you need to manage and grow your auto-detailing business in one platform.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Calendar className="h-6 w-6 text-[#00ae98]" />,
                title: "AI-Powered Booking",
                description: "Intelligent scheduling with natural language processing and conflict detection.",
              },
              {
                icon: <Users className="h-6 w-6 text-[#00ae98]" />,
                title: "Client Management",
                description: "Track client history, preferences, and vehicles for personalized service.",
              },
              {
                icon: <BarChart3 className="h-6 w-6 text-[#00ae98]" />,
                title: "Business Analytics",
                description: "Gain insights into your business performance with detailed reports and metrics.",
              },
              {
                icon: <Package className="h-6 w-6 text-[#00ae98]" />,
                title: "Inventory Management",
                description: "Track supplies, get low stock alerts, and manage orders efficiently.",
              },
              {
                icon: <CreditCard className="h-6 w-6 text-[#00ae98]" />,
                title: "Financial Operations",
                description: "Process payments, generate receipts, and track financial performance.",
              },
              {
                icon: <Calendar className="h-6 w-6 text-[#00ae98]" />,
                title: "Google Calendar Sync",
                description: "Seamlessly integrate with Google Calendar to avoid double-bookings.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-[#1a1a1a] rounded-xl p-6 border border-[#707070]/20 hover:border-[#00ae98]/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-[#00ae98]/10 flex items-center justify-center mb-4 group-hover:bg-[#00ae98]/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-[#a0a0a0]">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Feature Showcase */}
          <div className="mt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div className="order-2 md:order-1">
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00ae98] to-[#00ffdd] rounded-xl blur-[5px] opacity-50"></div>
                  <div className="relative rounded-xl overflow-hidden border border-[#707070]/20">
                    <Image
                      src="/auto-detailing-calendar.png"
                      alt="Booking Calendar"
                      width={800}
                      height={600}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>

              <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ae98]/10 border border-[#00ae98]/20 w-fit mb-4">
                  <span className="text-[#00ae98] text-sm font-medium">Smart Scheduling</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">AI-Powered Booking Management</h3>
                <p className="text-[#a0a0a0] mb-6">
                  Our intelligent booking system uses AI to understand natural language requests, check for conflicts,
                  and optimize your schedule for maximum efficiency.
                </p>

                <ul className="space-y-3">
                  {[
                    "Natural language booking requests",
                    "Automatic conflict detection",
                    "Google Calendar integration",
                    "Client booking history",
                    "Automated reminders and notifications",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="mt-1 w-5 h-5 rounded-full bg-[#00ae98]/20 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-[#00ae98]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-2 gap-12 items-center mt-24"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ae98]/10 border border-[#00ae98]/20 w-fit mb-4">
                  <span className="text-[#00ae98] text-sm font-medium">Client Insights</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Comprehensive Client Management</h3>
                <p className="text-[#a0a0a0] mb-6">
                  Build stronger relationships with your clients by tracking their preferences, service history, and
                  vehicle details all in one place.
                </p>

                <ul className="space-y-3">
                  {[
                    "Complete client profiles",
                    "Vehicle information tracking",
                    "Service history and preferences",
                    "Client lifetime value analytics",
                    "Personalized marketing campaigns",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="mt-1 w-5 h-5 rounded-full bg-[#00ae98]/20 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-[#00ae98]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00ae98] to-[#00ffdd] rounded-xl blur-[5px] opacity-50"></div>
                  <div className="relative rounded-xl overflow-hidden border border-[#707070]/20">
                    <Image
                      src="/auto-detailing-dashboard.png"
                      alt="Client Management"
                      width={800}
                      height={600}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#707070]/50 to-transparent"></div>

        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-[#a0a0a0] text-lg">
                Choose the plan that works best for your auto-detailing business.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$29",
                description: "Perfect for new businesses just getting started",
                features: [
                  "Up to 100 bookings per month",
                  "Client management",
                  "Basic analytics",
                  "Email notifications",
                  "Google Calendar integration",
                ],
                popular: false,
              },
              {
                name: "Professional",
                price: "$79",
                description: "Ideal for growing auto-detailing businesses",
                features: [
                  "Unlimited bookings",
                  "Advanced client management",
                  "Comprehensive analytics",
                  "Email & SMS notifications",
                  "Google Calendar integration",
                  "Inventory management",
                  "Staff scheduling",
                  "Marketing campaigns",
                ],
                popular: true,
              },
              {
                name: "Enterprise",
                price: "$149",
                description: "For established multi-location businesses",
                features: [
                  "Everything in Professional",
                  "Multi-location support",
                  "Advanced financial operations",
                  "Custom integrations",
                  "Dedicated account manager",
                  "Priority support",
                  "Custom reporting",
                  "White-label booking portal",
                ],
                popular: false,
              },
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={cn(
                  "bg-[#1a1a1a] rounded-xl p-8 border relative",
                  plan.popular ? "border-[#00ae98] shadow-[0_0_30px_rgba(0,174,152,0.2)]" : "border-[#707070]/20",
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#00ae98] text-black font-medium px-4 py-1 rounded-full text-sm">
                    Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-[#a0a0a0] mb-4">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-[#a0a0a0]">/month</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div
                        className={cn(
                          "mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                          plan.popular ? "bg-[#00ae98]/20" : "bg-[#707070]/20",
                        )}
                      >
                        <Check className={cn("h-3 w-3", plan.popular ? "text-[#00ae98]" : "text-[#a0a0a0]")} />
                      </div>
                      <span className="text-[#e0e0e0]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/sign-up">
                  <Button
                    className={cn(
                      "w-full h-12",
                      plan.popular
                        ? "bg-[#00ae98] hover:bg-[#00ae98]/90 text-black shadow-[0_0_15px_rgba(0,174,152,0.3)]"
                        : "bg-[#707070]/20 hover:bg-[#707070]/30 text-white",
                    )}
                  >
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 md:py-32 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#707070]/50 to-transparent"></div>

        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Auto-Detailing Professionals</h2>
              <p className="text-[#a0a0a0] text-lg">See what our customers have to say about DetailSync.</p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Michael Rodriguez",
                role: "Owner, Pristine Auto Spa",
                image: "/professional-dark-haired-man.png",
                quote:
                  "DetailSync has completely transformed how I run my auto detailing business. The booking system is intuitive and the client management features help me provide personalized service.",
              },
              {
                name: "Sarah Johnson",
                role: "Manager, Elite Detailing",
                image: "/professional-blonde-woman.png",
                quote:
                  "The analytics and reporting features have given me insights I never had before. I can now make data-driven decisions that have increased our revenue by 30% in just three months.",
              },
              {
                name: "David Chen",
                role: "Owner, Shine Masters",
                image: "/asian-professional-glasses.png",
                quote:
                  "I was spending hours each week on scheduling and client management. DetailSync has automated so much of this work, giving me back time to focus on growing my business.",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-[#1a1a1a] rounded-xl p-6 border border-[#707070]/20"
              >
                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-[#00ae98] text-[#00ae98]" />
                  ))}
                </div>

                <p className="text-[#e0e0e0] mb-6">"{testimonial.quote}"</p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-[#a0a0a0]">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#707070]/50 to-transparent"></div>

        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] rounded-2xl p-8 md:p-12 border border-[#707070]/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00ae98]/10 blur-[100px] rounded-full"></div>

            <div className="relative z-10 max-w-3xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Auto-Detailing Business?</h2>
              <p className="text-[#a0a0a0] text-lg mb-8">
                Join hundreds of auto-detailing professionals who are growing their businesses with DetailSync.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/sign-up">
                  <Button className="bg-[#00ae98] hover:bg-[#00ae98]/90 text-black font-medium h-12 px-6 shadow-[0_0_15px_rgba(0,174,152,0.5)]">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#pricing">
                  <Button variant="outline" className="border-[#707070] text-white hover:bg-[#707070]/10 h-12 px-6">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#707070]/50 to-transparent"></div>

        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#00ae98] flex items-center justify-center">
                  <span className="text-black font-bold text-sm">AD</span>
                </div>
                <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-[#00ae98] to-[#00ffdd]">
                  DetailSync
                </span>
              </div>
              <p className="text-[#a0a0a0] mb-4">The all-in-one platform for auto-detailing professionals.</p>
              <div className="flex items-center gap-4">
                {["twitter", "facebook", "instagram", "linkedin"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-8 h-8 rounded-full bg-[#707070]/20 flex items-center justify-center hover:bg-[#00ae98]/20 transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2">
                {["Features", "Pricing", "Testimonials", "Integrations", "Updates"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-[#a0a0a0] hover:text-[#00ae98] transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                {["About", "Blog", "Careers", "Contact", "Partners"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-[#a0a0a0] hover:text-[#00ae98] transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2">
                {["Documentation", "Help Center", "API", "Community", "Status"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-[#a0a0a0] hover:text-[#00ae98] transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-[#707070]/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#a0a0a0] text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} DetailSync. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-[#a0a0a0] hover:text-[#00ae98] text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-[#a0a0a0] hover:text-[#00ae98] text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-[#a0a0a0] hover:text-[#00ae98] text-sm transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
