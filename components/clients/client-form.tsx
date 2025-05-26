"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormError } from "@/components/common/form-error"
import type { Client } from "@/lib/types"
import { createClient } from "@/lib/actions/client-actions"

interface ClientFormProps {
  initialData?: Partial<Client>
  tenantId: string
  onSubmit?: (data: Partial<Client>) => Promise<void>
}

export function ClientForm({ initialData, tenantId, onSubmit }: ClientFormProps) {
  const router = useRouter()

  const [name, setName] = useState(initialData?.name || "")
  const [email, setEmail] = useState(initialData?.email || "")
  const [phone, setPhone] = useState(initialData?.phone || "")
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Name is required"
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) {
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

    try {
      const clientData = {
        name,
        email: email || undefined,
        phone: phone || undefined,
        notes: notes || undefined,
      }

      if (onSubmit) {
        await onSubmit(clientData)
      } else {
        await createClient(tenantId, clientData)
      }

      router.push(`/${tenantId}/clients`)
    } catch (error) {
      console.error("Error submitting client:", error)
      setErrors({
        form: "An error occurred while saving the client. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter client name"
            required
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter client email"
          />
          {errors.email && <FormError message={errors.email} />}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone
          </label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter client phone number"
          />
          {errors.phone && <FormError message={errors.phone} />}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-1">
            Notes
          </label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes about this client"
            rows={4}
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
          {isSubmitting ? "Saving..." : initialData?.id ? "Update Client" : "Create Client"}
        </Button>
      </div>
    </form>
  )
}
