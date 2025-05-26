"use client"

import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useClerk } from "@clerk/nextjs"

export function SignInButtonCustom({ className }: { className?: string }) {
  const router = useRouter()

  return (
    <SignInButton mode="modal" afterSignInUrl="/dashboard">
      <Button variant="outline" className={className}>
        Sign In
      </Button>
    </SignInButton>
  )
}

export function SignUpButtonCustom({ className }: { className?: string }) {
  const router = useRouter()

  return (
    <SignUpButton mode="modal" afterSignUpUrl="/onboarding">
      <Button className={className}>Sign Up</Button>
    </SignUpButton>
  )
}

export function SignOutButtonCustom({ className }: { className?: string }) {
  const { signOut } = useClerk()
  const router = useRouter()

  return (
    <Button variant="ghost" className={className} onClick={() => signOut(() => router.push("/"))}>
      Sign Out
    </Button>
  )
}
