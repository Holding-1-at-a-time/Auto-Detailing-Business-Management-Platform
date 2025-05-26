"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin"
import { MotionPathPlugin } from "gsap/MotionPathPlugin"

// Note: You'll need to register for GSAP business license to use these plugins commercially
// This is a conceptual implementation

export function AnimatedLogo({ width = 200, height = 80, onComplete, autoplay = true, loop = false, duration = 2.5 }) {
  const logoRef = useRef(null)
  const timelineRef = useRef(null)

  useEffect(() => {
    // Register GSAP plugins
    gsap.registerPlugin(DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin)

    // Create animation timeline
    const tl = gsap.timeline({
      paused: !autoplay,
      repeat: loop ? -1 : 0,
      repeatDelay: loop ? 1 : 0,
      onComplete: onComplete,
    })

    const logo = logoRef.current

    // Animation sequence
    tl.set([".ds-car", ".ds-droplet", ".ds-sync", ".ds-text"], { autoAlpha: 0 })

      // 1. Draw car outline
      .fromTo(".ds-car-path", { drawSVG: "0%" }, { duration: 0.8, drawSVG: "100%", ease: "power2.inOut" })

      // 2. Reveal car shape
      .to(".ds-car", { duration: 0.3, autoAlpha: 1, ease: "power1.inOut" })

      // 3. Water droplet appears and animates
      .fromTo(
        ".ds-droplet",
        { autoAlpha: 0, scale: 0, transformOrigin: "center center" },
        { duration: 0.5, autoAlpha: 1, scale: 1, ease: "back.out(1.7)" },
        "-=0.1",
      )

      // 4. Sync circle draws and rotates
      .fromTo(
        ".ds-sync-circle",
        { drawSVG: "0%", rotation: 0 },
        { duration: 0.7, drawSVG: "100%", rotation: 360, transformOrigin: "center center", ease: "power2.inOut" },
        "-=0.3",
      )

      // 5. Sync arrows appear
      .fromTo(
        ".ds-sync-arrow",
        { autoAlpha: 0, scale: 0 },
        { duration: 0.4, autoAlpha: 1, scale: 1, stagger: 0.1, ease: "back.out(1.7)" },
        "-=0.2",
      )

      // 6. Text reveals
      .fromTo(".ds-text", { autoAlpha: 0, x: -20 }, { duration: 0.5, autoAlpha: 1, x: 0, ease: "power2.out" }, "-=0.2")

      // 7. Final shine effect
      .fromTo(
        ".ds-shine",
        { autoAlpha: 0, scale: 0.8, transformOrigin: "center center" },
        { duration: 0.4, autoAlpha: 1, scale: 1, ease: "power1.out" },
        "-=0.1",
      )
      .to(".ds-shine", { duration: 0.6, autoAlpha: 0, ease: "power1.in" })

    timelineRef.current = tl

    return () => {
      tl.kill()
    }
  }, [autoplay, loop, onComplete, duration])

  // Methods to control animation
  const play = () => timelineRef.current?.play()
  const pause = () => timelineRef.current?.pause()
  const restart = () => timelineRef.current?.restart()

  return (
    <div className="detail-synk-animated-logo" ref={logoRef} style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 240 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Detail Synk animated logo"
      >
        {/* SVG content would go here - this is a placeholder structure */}
        <g className="ds-car">
          <path
            className="ds-car-path"
            d="M20,50 C30,30 60,30 70,50 L90,50 L95,40 L120,40 L125,50 L140,50 C150,50 150,70 140,70 L20,70 C10,70 10,50 20,50 Z"
            stroke="#0A2342"
            strokeWidth="2"
            fill="#0A2342"
          />
        </g>

        <g className="ds-droplet">
          <path d="M60,50 C60,40 70,30 70,40 C70,50 60,60 60,50 Z" fill="#2A9D8F" />
        </g>

        <g className="ds-sync">
          <circle className="ds-sync-circle" cx="90" cy="50" r="15" stroke="#2A9D8F" strokeWidth="2" fill="none" />
          <path className="ds-sync-arrow" d="M85,45 L90,50 L95,45" stroke="#2A9D8F" strokeWidth="2" fill="none" />
          <path className="ds-sync-arrow" d="M95,55 L90,50 L85,55" stroke="#2A9D8F" strokeWidth="2" fill="none" />
        </g>

        <g className="ds-text">
          <path d="M150,50 H220" stroke="#E6E8E6" strokeWidth="2" />
          <path d="M150,60 H200" stroke="#E6E8E6" strokeWidth="2" />
        </g>

        <circle className="ds-shine" cx="40" cy="45" r="5" fill="#E63946" fillOpacity="0.7" />
      </svg>

      {/* Animation controls - optional */}
      <div className="animation-controls" style={{ display: "none" }}>
        <button onClick={play}>Play</button>
        <button onClick={pause}>Pause</button>
        <button onClick={restart}>Restart</button>
      </div>
    </div>
  )
}
