"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Songfess } from "@/types/songfess"
import SongfessList from "@/components/songfess-list"
import { useWebSocket } from "@/hooks/use-websocket"
import { fetchSongfess } from "@/services/api"
import { useAuth } from "@/components/auth-provider"
import { formatDistanceToNow } from "date-fns"

export default function SongfessPage() {
  const [songfess, setSongfess] = useState<Songfess[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, refreshAuthStatus } = useAuth()

  // Initialize WebSocket connection
  const { lastMessage } = useWebSocket("ws://localhost:8080/songfess")

  // Fetch initial songfess entries
  const loadSongfess = async () => {
    try {
      setLoading(true)
      // Refresh auth status before making the request
      if (refreshAuthStatus) {
        await refreshAuthStatus()
      }
      const data = await fetchSongfess()
      setSongfess(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      console.error("Error fetching songfess:", err)
      setError("Failed to load songfess. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSongfess()
  }, [])

  // Handle new songfess from WebSocket
  useEffect(() => {
    if (lastMessage) {
      try {
        let newSongfess;
        if (typeof lastMessage === 'string') {
          newSongfess = JSON.parse(lastMessage);
        } else if (lastMessage.data) {
          newSongfess = JSON.parse(lastMessage.data);
        }
        
        if (newSongfess) {
          setSongfess((prev) => [newSongfess, ...prev])
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err)
      }
    }
  }, [lastMessage])

  // Handle songfess deletion
  const handleDeleteSongfess = (id: string) => {
    setSongfess((prev) => prev.filter((item) => item.id.toString() !== id))
  }

  // Add this helper function
  const formatSafeDate = (dateString: string | number | Date | null | undefined) => {
    if (!dateString) return "Unknown time";
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  }

  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <CardTitle>Songfess</CardTitle>
          <CardDescription>View and manage your song confessions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">Loading songfess...</div>
          ) : error ? (
            <div className="text-red-500 py-4">{error}</div>
          ) : (
            <SongfessList songfess={songfess} onDelete={handleDeleteSongfess} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

