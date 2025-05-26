"use client"

import { useUser } from "@clerk/nextjs"
import { useState } from "react"

export function useMetadata() {
  const { user, isLoaded } = useUser()
  const [isUpdating, setIsUpdating] = useState(false)

  // Get a value from public metadata
  function getPublicMetadata<T>(key: string, defaultValue?: T): T | undefined {
    if (!isLoaded || !user) return defaultValue

    return (user.publicMetadata[key] as T) || defaultValue
  }

  // Get a value from unsafe metadata
  function getUnsafeMetadata<T>(key: string, defaultValue?: T): T | undefined {
    if (!isLoaded || !user) return defaultValue

    return (user.unsafeMetadata[key] as T) || defaultValue
  }

  // Update unsafe metadata (can be done directly from frontend)
  async function updateUnsafeMetadata(metadata: Record<string, unknown>) {
    if (!isLoaded || !user) return

    try {
      setIsUpdating(true)

      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          ...metadata,
        },
      })

      return true
    } catch (error) {
      console.error("Error updating unsafe metadata:", error)
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    getPublicMetadata,
    getUnsafeMetadata,
    updateUnsafeMetadata,
    isUpdating,
    isLoaded,
  }
}
