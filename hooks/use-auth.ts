"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  sub: string
  email: string
  name: string
  picture: string
  isAdmin: boolean
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('https://api.himtalks.my.id/api/protected', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error("Auth status check error:", error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const login = () => {
    // Redirect to the backend Google login URL
    window.location.href = "https://api.himtalks.my.id/auth/google/login"
  }

  const logout = async () => {
    try {
      await fetch('https://api.himtalks.my.id/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      // Clear local state
      setUser(null)
      setIsAuthenticated(false)
      
      // Redirect to login page
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin: user?.isAdmin || false,
    login,
    logout,
    refreshAuthStatus: checkAuthStatus
  }
}
