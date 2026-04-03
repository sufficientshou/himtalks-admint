"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Trash2, UserPlus, Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Updated type to match API response
type AdminList = string[]

export default function AdminListPage() {
  const [admins, setAdmins] = useState<AdminList>([])
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [removingAdmin, setRemovingAdmin] = useState<string | null>(null)
  
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, isAdmin, isLoading } = useAuth()

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const response = await fetch("https://api.himtalks.my.id/api/admin/list", {
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      })

      if (!response.ok) {
        throw new Error("Failed to fetch admins")
      }

      const adminList = await response.json()
      setAdmins(Array.isArray(adminList) ? adminList : [])
    } catch (error) {
      console.error("Error fetching admins:", error)
      toast({
        title: "Error",
        description: "Failed to load admin list. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchAdmins()
    } else if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push("/")
    }
  }, [isAuthenticated, isAdmin, router, isLoading])

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive"
      })
      return
    }

    try {
      setAddingAdmin(true)
      const response = await fetch("https://api.himtalks.my.id/api/admin/addAdmin", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        throw new Error("Failed to add admin")
      }

      toast({
        title: "Success",
        description: "Admin added successfully"
      })
      
      setEmail("")
      fetchAdmins()
    } catch (error) {
      console.error("Error adding admin:", error)
      toast({
        title: "Error",
        description: "Failed to add admin. Please try again.",
        variant: "destructive"
      })
    } finally {
      setAddingAdmin(false)
    }
  }

  const handleRemoveAdmin = async (adminEmail: string) => {
    try {
      setRemovingAdmin(adminEmail)
      const response = await fetch("https://api.himtalks.my.id/api/admin/removeAdmin", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: adminEmail })
      })

      if (!response.ok) {
        throw new Error("Failed to remove admin")
      }

      const result = await response.json()
      toast({
        title: "Success",
        description: result.message || "Admin removed successfully"
      })

      fetchAdmins()
    } catch (error) {
      console.error("Error removing admin:", error)
      toast({
        title: "Error",
        description: "Failed to remove admin. Please try again.",
        variant: "destructive"
      })
    } finally {
      setRemovingAdmin(null)
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
            <Users className="h-5 w-5 md:h-6 md:w-6" />
            Admin Management
          </CardTitle>
          <CardDescription>Add or remove admin users</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-2 mb-6">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={addingAdmin}
              className="w-full sm:w-auto"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {addingAdmin ? "Adding..." : "Add Admin"}
            </Button>
          </form>

          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-9 w-20" />
                </div>
              ))}
            </div>
          ) : admins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mb-2 opacity-50" />
              <p>No admins found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {admins.map((adminEmail, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/50 rounded-md gap-2"
                >
                  <div className="font-medium break-words">{adminEmail}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 self-end sm:self-auto"
                    onClick={() => handleRemoveAdmin(adminEmail)}
                    disabled={removingAdmin === adminEmail}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {removingAdmin === adminEmail ? "Removing..." : "Remove"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}