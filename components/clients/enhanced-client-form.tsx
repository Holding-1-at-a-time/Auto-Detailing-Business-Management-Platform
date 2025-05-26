"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormError } from "@/components/common/form-error"
import type { Client } from "@/lib/types"
import { Loader2 } from "lucide-react"

interface EnhancedClientFormProps {
  client?: Client
  tenantId: string
}

export function EnhancedClientForm({ client, tenantId }: EnhancedClientFormProps) {
  const router = useRouter()
  const isEditing = !!client

  const [formData, setFormData] = useState({
    name: client?.name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    notes: client?.notes || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pre-populate form when editing
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        notes: client.notes || "",
      })
    }
  }, [client])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (formData.phone && !/^[0-9+\-\s()]{7,20}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const url = isEditing ? `/${tenantId}/clients/${client.id}/route` : `/${tenantId}/clients/new/route`

      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          notes: formData.notes || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save client")
      }

      router.push(`/${tenantId}/clients`)
      router.refresh()
    } catch (error) {
      console.error("Error submitting client:", error)
      setErrors({
        form: error instanceof Error ? error.message : "An error occurred while saving the client. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange =
    (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name *
          </label>
          <Input
            id="name"
            value={formData.name}
            onChange={handleInputChange("name")}
            placeholder="Enter client name"
            required
            disabled={isSubmitting}
          />
          {errors.name && <FormError message={errors.name} />}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange("email")}
            placeholder="Enter client email"
            disabled={isSubmitting}
          />
          {errors.email && <FormError message={errors.email} />}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone
          </label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={handleInputChange("phone")}
            placeholder="Enter client phone number"
            disabled={isSubmitting}
          />
          {errors.phone && <FormError message={errors.phone} />}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-1">
            Notes
          </label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={handleInputChange("notes")}
            placeholder="Add any additional notes about this client"
            rows={4}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {errors.form && <FormError message={errors.form} />}

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${tenantId}/clients`)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : isEditing ? (
            "Update Client"
          ) : (
            "Create Client"
          )}
        </Button>
      </div>
    </form>
  )
}
