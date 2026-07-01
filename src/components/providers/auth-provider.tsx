// src/providers/AuthProvider.tsx (atau letakkan di komponen yang sesuai)
"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

function AuthRedirector({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "authenticated" && session?.user?.isNewUser) {
      if (pathname !== "/profile/edit" && !pathname.startsWith("/api/")) {
        router.replace("/profile/edit?status=new_registration")
      }
    }
  }, [status, session, pathname, router])

  return <>{children}</>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthRedirector>
        {children}
      </AuthRedirector>
    </SessionProvider>
  )
}