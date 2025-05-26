"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function SeedDatabaseButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSeed = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Database seeded successfully",
          description: result.stats
            ? `Created ${result.stats.tenants} tenants, ${result.stats.clients} clients, and ${result.stats.bookings} bookings.`
            : "Demo data has been added to your database.",
          variant: "default",
        })
      } else {
        toast({
          title: "Seeding not required",
          description: result.message || "Your database already has data.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error seeding database:", error)
      toast({
        title: "Error",
        description: "Failed to seed the database. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleSeed} disabled={isLoading} variant="outline" className="flex items-center gap-2">
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {isLoading ? "Seeding..." : "Seed Demo Data"}
    </Button>
  )
}
