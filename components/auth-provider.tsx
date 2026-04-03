"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  name: string
  email?: string | null
  picture?: null
  isAdmin?: boolean
  // other user properties
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  login: () => void
  logout: () => Promise<void>
  refreshAuthStatus: () => Promise<void> // Add this line
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("https://api.himtalks.my.id/api/protected", {
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      })

      if (response.ok) {
        // Check if the response is JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await response.json()
          setUser(data.user)
          setIsAuthenticated(true)
        } else {
          // Handle text response - user is authenticated but response is not JSON
          const text = await response.text()
          console.log("Auth successful with text response:", text)
          
          // Extract email from welcome message
          let name = "Admin";
          let email = null;
          const welcomeMatch = text.match(/Welcome,\s+([\w.@]+)!/i);
          if (welcomeMatch && welcomeMatch[1]) {
            email = welcomeMatch[1];
            // Get name part before @ if it's an email
            name = email.includes('@') ? email.split('@')[0] : email;
          }

          setUser({ 
            id: "1", 
            name,
            email,
            isAdmin: true, // Set based on your needs
            picture: null // Set default picture
          });
          setIsAuthenticated(true);
        }
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

  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Modified to use redirection for Google OAuth
  const login = () => {
    // Redirect to the Google OAuth endpoint
    window.location.href = "https://api.himtalks.my.id/auth/google/login"
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch("https://api.himtalks.my.id/auth/logout", {
        method: "POST",
        credentials: "include"
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      router.push("/")
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      isAdmin: user?.isAdmin || false,
      login, 
      logout,
      refreshAuthStatus: checkAuthStatus // Add this line to expose the function
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

