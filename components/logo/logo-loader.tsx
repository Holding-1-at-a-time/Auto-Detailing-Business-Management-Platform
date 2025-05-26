"use client"

import { useEffect, useState } from "react"
import { AnimatedLogo } from "./animated-logo"

export function LogoLoader({ onComplete, minDuration = 2000 }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const startTime = Date.now()

    const handleAnimationComplete = () => {
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, minDuration - elapsedTime)

      // Ensure the loader shows for at least minDuration
      setTimeout(() => {
        setIsVisible(false)
        if (onComplete) onComplete()
      }, remainingTime)
    }

    return () => {
      // Cleanup if needed
    }
  }, [onComplete, minDuration])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
      <div className="text-center">
        <AnimatedLogo width={300} height={120} autoplay={true} loop={false} onComplete={onComplete} />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading Detail Synk...</p>
      </div>
    </div>
  )
}
