"use client"

import { useState } from "react"
import { AnimatedLogo } from "@/components/logo/animated-logo"
import { LottieAnimatedLogo } from "@/components/logo/lottie-animated-logo"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LogoShowcase() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [animationType, setAnimationType] = useState("gsap")

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Detail Synk Animated Logo</h1>

      <div className="flex flex-col items-center justify-center mb-12">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mb-6 w-full max-w-2xl">
          <Tabs defaultValue="standard" className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="standard">Standard</TabsTrigger>
              <TabsTrigger value="web">Web Optimized</TabsTrigger>
              <TabsTrigger value="video">Video Intro</TabsTrigger>
            </TabsList>

            <TabsContent value="standard" className="flex justify-center py-8">
              {animationType === "gsap" ? (
                <AnimatedLogo
                  width={300}
                  height={120}
                  autoplay={isPlaying}
                  loop={false}
                  onComplete={() => setIsPlaying(false)}
                />
              ) : (
                <LottieAnimatedLogo
                  width={300}
                  height={120}
                  autoplay={isPlaying}
                  loop={false}
                  onComplete={() => setIsPlaying(false)}
                />
              )}
            </TabsContent>

            <TabsContent value="web" className="flex justify-center py-8">
              {animationType === "gsap" ? (
                <AnimatedLogo width={200} height={80} autoplay={isPlaying} loop={true} duration={1.8} />
              ) : (
                <LottieAnimatedLogo width={200} height={80} autoplay={isPlaying} loop={true} />
              )}
            </TabsContent>

            <TabsContent value="video" className="flex justify-center py-8 bg-gray-900">
              {animationType === "gsap" ? (
                <AnimatedLogo
                  width={400}
                  height={160}
                  autoplay={isPlaying}
                  loop={false}
                  duration={3.5}
                  onComplete={() => setIsPlaying(false)}
                />
              ) : (
                <LottieAnimatedLogo
                  width={400}
                  height={160}
                  autoplay={isPlaying}
                  loop={false}
                  onComplete={() => setIsPlaying(false)}
                />
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-center space-x-4">
            <Button onClick={handlePlayToggle}>{isPlaying ? "Pause Animation" : "Play Animation"}</Button>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">
                <input
                  type="radio"
                  name="animationType"
                  value="gsap"
                  checked={animationType === "gsap"}
                  onChange={() => setAnimationType("gsap")}
                  className="mr-1"
                />
                GSAP
              </label>

              <label className="text-sm font-medium">
                <input
                  type="radio"
                  name="animationType"
                  value="lottie"
                  checked={animationType === "lottie"}
                  onChange={() => setAnimationType("lottie")}
                  className="mr-1"
                />
                Lottie
              </label>
            </div>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-2xl">
          <h2>Animation Specifications</h2>
          <p>
            The Detail Synk animated logo brings the brand identity to life through a carefully choreographed sequence
            that emphasizes precision, synchronization, and premium detailing.
          </p>

          <h3>Animation Sequence</h3>
          <ol>
            <li>Car silhouette draws from left to right</li>
            <li>Water droplet appears with a slight bounce</li>
            <li>Sync circle draws while rotating 360°</li>
            <li>Sync arrows fade in with slight scaling</li>
            <li>Text reveals from left to right</li>
            <li>Final shine effect pulses across the logo</li>
          </ol>

          <h3>Implementation Options</h3>
          <ul>
            <li>
              <strong>GSAP</strong>: High performance for web applications
            </li>
            <li>
              <strong>Lottie</strong>: Cross-platform compatibility
            </li>
            <li>
              <strong>Video Export</strong>: For video productions and presentations
            </li>
          </ul>

          <h3>Usage Guidelines</h3>
          <ul>
            <li>Website header: Use the web-optimized version</li>
            <li>App loading screen: Use the standard version</li>
            <li>Video presentations: Use the video intro version</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
