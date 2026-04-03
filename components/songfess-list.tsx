"use client"

import { useRouter } from "next/navigation"
import type { Songfess } from "@/types/songfess"
import { Card, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Music, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { deleteSongfess } from "@/services/api"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useLoginModal } from "@/hooks/use-login-modal"
import { formatSafeDate, formatExactDate } from "@/lib/date-utils"

interface SongfessListProps {
  songfess: Songfess[]
  onDelete: (id: string) => void
}

export default function SongfessList({ songfess, onDelete }: SongfessListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const { showLoginModal } = useLoginModal()

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent navigation when clicking delete
    
    if (!isAuthenticated) {
      showLoginModal()
      return
    }

    try {
      setDeletingId(id)
      await deleteSongfess(id)
      onDelete(id)
      toast({
        title: "Songfess deleted",
        description: "The songfess has been successfully deleted."
      })
    } catch (error) {
      console.error("Failed to delete songfess:", error)
      toast({
        title: "Error",
        description: "Failed to delete songfess. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDeletingId(null)
    }
  }

  const goToDetails = (id: string) => {
    router.push(`/songfess/${id}`)
  }

  return (
    <div className="space-y-4">
      {songfess.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No songfess found.</div>
      ) : (
        songfess.map((item) => (
          <Card 
            key={item.id} 
            className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50"
            onClick={() => goToDetails(item.id.toString())}
          >
            <CardContent className="p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded overflow-hidden bg-gray-100">
                    {item.album_art ? (
                      <img 
                        src={item.album_art} 
                        alt={item.song_title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Music className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{item.song_title || "Unknown Song"}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.artist || "Unknown Artist"}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground" title={formatExactDate(item.created_at)}>
                  {formatSafeDate(item.created_at)}
                </div>
              </div>
              
              <div className="mt-5 space-y-3">
                <p className="text-sm md:text-base leading-relaxed line-clamp-3">{item.content}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>From: {item.sender_name || "Anonymous"} • To: {item.recipient_name || "Unknown"}</span>
                  {(item.start_time !== undefined || item.end_time !== undefined) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                      🕒 Timed: {item.start_time !== undefined ? `${Math.floor(item.start_time / 60)}:${(item.start_time % 60).toString().padStart(2, '0')}` : '--'}
                      {item.start_time !== undefined && item.end_time !== undefined ? ' - ' : ''}
                      {item.end_time !== undefined ? `${Math.floor(item.end_time / 60)}:${(item.end_time % 60).toString().padStart(2, '0')}` : ''}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="bg-muted/30 p-4 border-t">
              <div className="flex w-full justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToDetails(item.id.toString())}
                >
                  View Details
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={(e) => handleDelete(e, item.id.toString())}
                  disabled={deletingId === item.id.toString()}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {deletingId === item.id.toString() ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  )
}

