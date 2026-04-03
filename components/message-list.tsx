"use client"

import type { Message } from "@/types/message"
import { Card, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { deleteMessage } from "@/services/api"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useLoginModal } from "@/hooks/use-login-modal"
import { formatSafeDate, formatExactDate } from "@/lib/date-utils"

interface MessageListProps {
  messages: Message[]
  onDelete: (id: string) => void
}

export default function MessageList({ messages, onDelete }: MessageListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const { showLoginModal } = useLoginModal()

  const handleDelete = async (id: string) => {
    if (!isAuthenticated) {
      showLoginModal()
      return
    }

    try {
      setDeletingId(id)
      await deleteMessage(id)
      onDelete(id)
      toast({
        title: "Message deleted",
        description: "The message has been successfully deleted."
      })
    } catch (error) {
      console.error("Failed to delete message:", error)
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No messages found.</div>
      ) : (
        messages.map((message) => (
          <Card key={message.id} className="overflow-hidden hover:shadow-md transition-all duration-300 border-border/50">
            <CardContent className="p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>{message.sender_name?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{message.sender_name || "Anonymous"}</p>
                    <p className="text-sm text-muted-foreground">
                      To: {message.recipient_name || "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground" title={formatExactDate(message.created_at)}>
                  {formatSafeDate(message.created_at)}
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <p className="text-sm md:text-base leading-relaxed">{message.content}</p>
                {message.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {message.category}
                  </span>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 p-4 border-t">
              <div className="flex w-full justify-end items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(message.id.toString())}
                  disabled={deletingId === message.id.toString()}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {deletingId === message.id.toString() ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  )
}

