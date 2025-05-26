"use client"

import { useEffect, useRef } from "react"
import lottie from "lottie-web"

export function LottieAnimatedLogo({ width = 200, height = 80, autoplay = true, loop = false, onComplete }) {
  const containerRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      // In a real implementation, you would import your Lottie JSON file
      // import animationData from '@/public/logo/detailsynk-animation.json'

      // This is a placeholder for the animation configuration
      const animationData = {
        // Lottie JSON would go here
        // This would be exported from After Effects via Bodymovin/Lottie
      }

      animationRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: loop,
        autoplay: autoplay,
        animationData: animationData,
        rendererSettings: {
          progressiveLoad: true,
          preserveAspectRatio: "xMidYMid meet",
        },
      })

      if (onComplete) {
        animationRef.current.addEventListener("complete", onComplete)
      }

      return () => {
        animationRef.current.destroy()
        if (onComplete) {
          animationRef.current.removeEventListener("complete", onComplete)
        }
      }
    }
  }, [autoplay, loop, onComplete])

  return <div ref={containerRef} style={{ width, height }} aria-label="Detail Synk animated logo" />
}
