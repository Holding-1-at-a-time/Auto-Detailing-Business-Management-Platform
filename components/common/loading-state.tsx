import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  text?: string
  size?: "sm" | "md" | "lg"
  fullScreen?: boolean
}

export function LoadingState({ text = "Loading...", size = "md", fullScreen = false }: LoadingStateProps) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  const containerClass = fullScreen
    ? "flex items-center justify-center min-h-screen"
    : "flex items-center justify-center min-h-[200px]"

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={`${sizeClass[size]} animate-spin`} />
        <p className="text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}
