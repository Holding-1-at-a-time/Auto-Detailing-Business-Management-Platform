"use client"

import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AiParsingStatusProps {
  status: "idle" | "parsing" | "success" | "error"
  message?: string
  className?: string
}

export function AiParsingStatus({ status, message, className }: AiParsingStatusProps) {
  if (status === "idle") {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md p-3 text-sm",
        {
          "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300": status === "parsing",
          "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300": status === "success",
          "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300": status === "error",
        },
        className,
      )}
    >
      {status === "parsing" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{message || "AI is parsing your request..."}</span>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle className="h-4 w-4" />
          <span>{message || "Successfully parsed your booking request"}</span>
        </>
      )}
      {status === "error" && (
        <>
          <XCircle className="h-4 w-4" />
          <span>{message || "Failed to parse your request. Please fill in the details manually."}</span>
        </>
      )}
    </div>
  )
}
