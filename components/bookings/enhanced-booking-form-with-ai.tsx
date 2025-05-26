"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Loader2, Sparkles } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { ApiError } from "@/components/common/api-error"
import { AiParsingStatus } from "./ai-parsing-status"
import { bookingFormSchema, type BookingFormValues } from "./booking-form-validation"
import { parseBookingRequest } from "@/lib/ai/booking-parser"
import { useTenant } from "@/hooks/useTenant"
import type { Booking } from "@/lib/types"

interface EnhancedBookingFormWithAiProps {
  clients: { id: string; name: string }[]
  services: string[]
  booking?: Partial<Booking>
  isEdit?: boolean
}

export function EnhancedBookingFormWithAi({
  clients,
  services,
  booking,
  isEdit = false,
}: EnhancedBookingFormWithAiProps) {
  const router = useRouter()
  const { tenantId } = useTenant()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useAiAssist, setUseAiAssist] = useState(false)
  const [aiInput, setAiInput] = useState("")
  const [aiParsingStatus, setAiParsingStatus] = useState<"idle" | "parsing" | "success" | "error">("idle")

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      clientId: booking?.clientId || "",
      dateTime: booking?.dateTime ? Number(booking.dateTime) : undefined,
      service: booking?.service || "",
      notes: booking?.notes || "",
    },
  })

  const handleAiParse = async () => {
    if (!aiInput.trim()) return

    try {
      setAiParsingStatus("parsing")
      const parsed = await parseBookingRequest(aiInput)

      // Update form with parsed data
      if (parsed.service) {
        const matchedService = services.find((s) => s.toLowerCase().includes(parsed.service.toLowerCase()))
        if (matchedService) {
          form.setValue("service", matchedService)
        }
      }

      if (parsed.date && parsed.time) {
        const [year, month, day] = parsed.date.split("-").map(Number)
        const [hours, minutes] = parsed.time.split(":").map(Number)
        const dateTime = new Date(year, month - 1, day, hours, minutes)
        form.setValue("dateTime", dateTime.getTime())
      }

      if (parsed.notes) {
        form.setValue("notes", parsed.notes)
      }

      // If client info is provided, we could search for existing client
      // For now, just add to notes if not found
      if (parsed.clientName && !parsed.clientEmail && !parsed.clientPhone) {
        const existingNotes = form.getValues("notes")
        form.setValue("notes", `${existingNotes}\nClient: ${parsed.clientName}`.trim())
      }

      setAiParsingStatus("success")
      setTimeout(() => setAiParsingStatus("idle"), 3000)
    } catch (err) {
      console.error("AI parsing error:", err)
      setAiParsingStatus("error")
      setTimeout(() => setAiParsingStatus("idle"), 5000)
    }
  }

  const onSubmit = async (data: BookingFormValues) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch(`/${tenantId}/bookings/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          useAiParsing: useAiAssist,
          aiInput: useAiAssist ? aiInput : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create booking")
      }

      const result = await response.json()
      router.push(`/${tenantId}/bookings/${result.bookingId}`)
      router.refresh()
    } catch (err) {
      console.error("Error submitting booking:", err)
      setError(err instanceof Error ? err.message : "Failed to save booking. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && <ApiError title="Booking Error" error={error} reset={() => setError(null)} />}

      <div className="flex items-center space-x-2">
        <Switch id="ai-assist" checked={useAiAssist} onCheckedChange={setUseAiAssist} />
        <Label htmlFor="ai-assist" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI Assist
        </Label>
      </div>

      {useAiAssist && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-input">Describe your booking in plain English</Label>
            <Textarea
              id="ai-input"
              placeholder="Example: I need a ceramic coating next Friday at 2pm"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              className="min-h-[100px]"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAiParse}
              disabled={!aiInput.trim() || aiParsingStatus === "parsing"}
            >
              {aiParsingStatus === "parsing" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Parse with AI
            </Button>
          </div>

          <AiParsingStatus status={aiParsingStatus} />
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select an existing client or{" "}
                  <Button variant="link" className="p-0 h-auto" onClick={() => router.push(`/${tenantId}/clients/new`)}>
                    add a new client
                  </Button>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="dateTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date & Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                          disabled={isSubmitting}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(new Date(field.value), "PPP 'at' p")
                          ) : (
                            <span>Pick a date and time</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(date.getTime())
                          }
                        }}
                        disabled={(date) => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          return date < today
                        }}
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <Label>Time</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map((time) => {
                            const [hours, minutes] = time.split(":").map(Number)
                            const isSelected =
                              field.value &&
                              new Date(field.value).getHours() === hours &&
                              new Date(field.value).getMinutes() === minutes

                            return (
                              <Button
                                key={time}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  const date = field.value ? new Date(field.value) : new Date()
                                  date.setHours(hours, minutes, 0, 0)
                                  field.onChange(date.getTime())
                                }}
                              >
                                {time}
                              </Button>
                            )
                          })}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add any special instructions or notes here"
                    className="resize-none"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update Booking" : "Create Booking"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
