"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useTenant } from "@/hooks/useTenant"
import { useConvex } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Calendar, MessageSquare, Mail, CheckCircle, XCircle } from "lucide-react"

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  connected: boolean
  settings?: Record<string, any>
}

export function IntegrationsSettings() {
  const { tenant, tenantSettings } = useTenant()
  const convex = useConvex()
  const { toast } = useToast()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadIntegrations()
  }, [tenant, tenantSettings])

  const loadIntegrations = async () => {
    if (!tenant) return

    try {
      // Load integration status from Convex
      const googleCalendar = await convex.query(api.integrations.getGoogleCalendarStatus, {
        tenantId: tenant._id,
      })

      const emailSettings = await convex.query(api.integrations.getEmailSettings, {
        tenantId: tenant._id,
      })

      const smsSettings = await convex.query(api.integrations.getSmsSettings, {
        tenantId: tenant._id,
      })

      setIntegrations([
        {
          id: "google-calendar",
          name: "Google Calendar",
          description: "Sync bookings with your Google Calendar",
          icon: <Calendar className="h-5 w-5" />,
          connected: googleCalendar?.connected || false,
          settings: googleCalendar?.settings,
        },
        {
          id: "email-notifications",
          name: "Email Notifications",
          description: "Send automated email confirmations and reminders",
          icon: <Mail className="h-5 w-5" />,
          connected: emailSettings?.enabled || false,
          settings: emailSettings,
        },
        {
          id: "sms-notifications",
          name: "SMS Notifications",
          description: "Send SMS reminders via Twilio",
          icon: <MessageSquare className="h-5 w-5" />,
          connected: smsSettings?.enabled || false,
          settings: smsSettings,
        },
      ])
    } catch (error) {
      console.error("Error loading integrations:", error)
      toast({
        title: "Error",
        description: "Failed to load integration settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleIntegration = async (integrationId: string, enabled: boolean) => {
    if (!tenant) return

    try {
      switch (integrationId) {
        case "google-calendar":
          if (enabled) {
            // Redirect to Google OAuth
            window.location.href = `/api/integrations/google-calendar/connect?tenantId=${tenant._id}`
          } else {
            await convex.mutation(api.integrations.disconnectGoogleCalendar, {
              tenantId: tenant._id,
            })
          }
          break
        case "email-notifications":
          await convex.mutation(api.integrations.updateEmailSettings, {
            tenantId: tenant._id,
            enabled,
          })
          break
        case "sms-notifications":
          await convex.mutation(api.integrations.updateSmsSettings, {
            tenantId: tenant._id,
            enabled,
          })
          break
      }

      // Reload integrations
      await loadIntegrations()

      toast({
        title: "Success",
        description: `${enabled ? "Connected" : "Disconnected"} integration successfully`,
      })
    } catch (error) {
      console.error("Error toggling integration:", error)
      toast({
        title: "Error",
        description: "Failed to update integration",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading integrations...</div>
  }

  return (
    <div className="space-y-6">
      {integrations.map((integration) => (
        <Card key={integration.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {integration.icon}
                <div>
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  <CardDescription>{integration.description}</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {integration.connected ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Disconnected
                  </Badge>
                )}
                <Switch
                  checked={integration.connected}
                  onCheckedChange={(checked) => handleToggleIntegration(integration.id, checked)}
                />
              </div>
            </div>
          </CardHeader>

          {integration.connected && integration.settings && (
            <CardContent>
              <IntegrationSettings integration={integration} onUpdate={loadIntegrations} />
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}

function IntegrationSettings({
  integration,
  onUpdate,
}: {
  integration: Integration
  onUpdate: () => void
}) {
  const { tenant } = useTenant()
  const convex = useConvex()
  const { toast } = useToast()
  const [settings, setSettings] = useState(integration.settings || {})
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveSettings = async () => {
    if (!tenant) return

    setIsSaving(true)
    try {
      switch (integration.id) {
        case "email-notifications":
          await convex.mutation(api.integrations.updateEmailSettings, {
            tenantId: tenant._id,
            enabled: true,
            settings,
          })
          break
        case "sms-notifications":
          await convex.mutation(api.integrations.updateSmsSettings, {
            tenantId: tenant._id,
            enabled: true,
            settings,
          })
          break
      }

      toast({
        title: "Success",
        description: "Settings saved successfully",
      })
      onUpdate()
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (integration.id === "google-calendar") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Calendar ID:</span>
          <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
            {integration.settings?.calendarId || "primary"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">Bookings will be automatically synced to your Google Calendar</p>
      </div>
    )
  }

  if (integration.id === "sms-notifications") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="twilioAccountSid">Twilio Account SID</Label>
          <Input
            id="twilioAccountSid"
            value={settings.accountSid || ""}
            onChange={(e) => setSettings({ ...settings, accountSid: e.target.value })}
            placeholder="Enter your Twilio Account SID"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twilioAuthToken">Twilio Auth Token</Label>
          <Input
            id="twilioAuthToken"
            type="password"
            value={settings.authToken || ""}
            onChange={(e) => setSettings({ ...settings, authToken: e.target.value })}
            placeholder="Enter your Twilio Auth Token"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twilioPhoneNumber">Twilio Phone Number</Label>
          <Input
            id="twilioPhoneNumber"
            value={settings.phoneNumber || ""}
            onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
            placeholder="+1234567890"
          />
        </div>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    )
  }

  return null
}
