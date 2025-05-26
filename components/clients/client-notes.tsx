"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormError } from "@/components/common/form-error"
import { useMutation } from "convex/react"

interface ClientNotesProps {
  tenantId: string
  clientId: string
  initialNotes?: string
}

export function ClientNotes({ tenantId, clientId, initialNotes = "" }: ClientNotesProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateClientMutation = useMutation("clients.updateClient")

  const handleSave = async () => {
    setError(null)
    setIsSaving(true)

    try {
      await updateClientMutation({
        tenantId,
        clientId,
        notes,
      })
      setIsEditing(false)
    } catch (err) {
      console.error("Error saving notes:", err)
      setError(err instanceof Error ? err.message : "Failed to save notes. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <FormError message={error} className="mb-4" />}

        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this client..."
              className="min-h-[120px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setNotes(initialNotes)
                  setIsEditing(false)
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Notes"}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {notes ? (
              <div className="whitespace-pre-wrap">{notes}</div>
            ) : (
              <div className="text-muted-foreground italic">No notes added yet.</div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="mt-4 text-primary hover:text-primary/80"
            >
              {notes ? "Edit Notes" : "Add Notes"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
