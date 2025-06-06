/**
    * @description      : 
    * @author           : rrome
    * @group            : 
    * @created          : 26/05/2025 - 09:06:49
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 26/05/2025
    * - Author          : rrome
    * - Modification    : 
**/
"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import Error from "next/error";
import { useEffect } from "react";


export default function GlobalError({ error }: { error: Error }) {
  useEffect(() => {
    // Log the error to an error reporting service
    Sentry.captureException(error);
    console.error(error)
  }, [error]),  [error];

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">We apologize for the inconvenience. Please try again later.</p>
            <Button onClick={reset}>Try again</Button>
          </div>
        </div>
      </body>
    </html>
  )
}
