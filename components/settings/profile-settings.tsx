"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useTenant } from "@/hooks/useTenant"
import { useConvex } from "convex/react"
import { api } from "@/convex/_generated/api"
import { FormError } from "@/components/common/form-error"
import { Loader2, Upload } from "lucide-react"

const profileSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  timezone: z.string().min(1, "Timezone is required"),
  logoUrl: z.string().url().optional().or(z.literal("")),
})

type ProfileFormData = z.infer<typeof profileSchema>

const timezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
  "UTC",
]

export function ProfileSettings() {
  const { tenant, tenantSettings } = useTenant()
  const convex = useConvex()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: tenantSettings?.businessName || tenant?.name || "",
      timezone: tenantSettings?.timezone || tenant?.timezone || "America/New_York",
      logoUrl: tenantSettings?.logoUrl || tenant?.logoUrl || "",
    },
  })

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Logo file must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setLogoFile(file)

    // Create a preview URL
    const previewUrl = URL.createObjectURL(file)
    setValue("logoUrl", previewUrl)
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (!tenant) return

    setIsLoading(true)
    try {
      let logoUrl = data.logoUrl

      // Upload logo if a new file was selected
      if (logoFile) {
        const formData = new FormData()
        formData.append("file", logoFile)
        formData.append("tenantId", tenant._id)

        const response = await fetch("/api/upload/logo", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Failed to upload logo")
        }

        const { url } = await response.json()
        logoUrl = url
      }

      // Update tenant settings
      await convex.mutation(api.tenants.updateTenantSettings, {
        tenantId: tenant._id,
        businessName: data.businessName,
        timezone: data.timezone,
        logoUrl: logoUrl || undefined,
      })

      // Also update the main tenant record
      await convex.mutation(api.tenants.updateTenant, {
        tenantId: tenant._id,
        name: data.businessName,
        timezone: data.timezone,
        logoUrl: logoUrl || undefined,
      })

      toast({
        title: "Success",
        description: "Profile settings updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input id="businessName" {...register("businessName")} placeholder="Enter your business name" />
          {errors.businessName && <FormError message={errors.businessName.message} />}
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select value={watch("timezone")} onValueChange={(value) => setValue("timezone", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.timezone && <FormError message={errors.timezone.message} />}
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo">Business Logo</Label>
          <div className="flex items-center space-x-4">
            {watch("logoUrl") && (
              <img
                src={watch("logoUrl") || "/placeholder.svg"}
                alt="Business logo"
                className="h-16 w-16 object-cover rounded-lg border"
              />
            )}
            <div className="flex-1">
              <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("logo")?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
              </Button>
            </div>
          </div>
          {errors.logoUrl && <FormError message={errors.logoUrl.message} />}
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Save Changes
      </Button>
    </form>
  )
}
