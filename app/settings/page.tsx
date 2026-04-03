"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Trash2, Settings, Clock, AlertTriangle, Plus, Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"

// Updated interface to match API response
type BlacklistedWords = string[]

// Update the interface to match the actual API response format
interface ConfigsResponse {
  songfess_days: string;
  message_char_limit: string;
  [key: string]: string;
}

export default function SettingsPage() {
  const [blacklistedWords, setBlacklistedWords] = useState<BlacklistedWords>([])
  const [songfessDays, setSongfessDays] = useState<string>("")
  const [currentSongfessDays, setCurrentSongfessDays] = useState<string>("")
  const [newWord, setNewWord] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingWords, setLoadingWords] = useState(true)
  const [addingWord, setAddingWord] = useState(false)
  const [removingWord, setRemovingWord] = useState<string | null>(null)
  const [updatingSongfessDays, setUpdatingSongfessDays] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, isAdmin } = useAuth()

  const fetchBlacklistedWords = async () => {
    try {
      setLoadingWords(true)
      const response = await fetch("https://api.himtalks.my.id/api/admin/blacklist", {
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      })

      if (!response.ok) {
        throw new Error("Failed to fetch blacklisted words")
      }

      // Parse response as string array
      const wordsList = await response.json()
      setBlacklistedWords(Array.isArray(wordsList) ? wordsList : [])
    } catch (error) {
      console.error("Error fetching blacklisted words:", error)
      toast({
        title: "Error",
        description: "Failed to load blacklisted words. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoadingWords(false)
    }
  }

  // Then update the fetchSongfessDays function
  const fetchSongfessDays = async () => {
    try {
      const response = await fetch("https://api.himtalks.my.id/api/admin/configs", {
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      })

      if (!response.ok) {
        throw new Error("Failed to fetch configs")
      }

      const data = await response.json() as ConfigsResponse
      // No longer nested under configs object
      setCurrentSongfessDays(data.songfess_days || "")
      setSongfessDays(data.songfess_days || "")
    } catch (error) {
      console.error("Error fetching songfess configs:", error)
    }
  }

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      const loadData = async () => {
        setLoading(true)
        await Promise.all([
          fetchBlacklistedWords(),
          fetchSongfessDays()
        ])
        setLoading(false)
      }
      
      loadData()
    } else if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push("/")
    }
  }, [isAuthenticated, isAdmin, router])

  const handleAddBlacklistWord = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newWord.trim()) {
      toast({
        title: "Error",
        description: "Word is required",
        variant: "destructive"
      })
      return
    }

    try {
      setAddingWord(true)
      const response = await fetch("https://api.himtalks.my.id/api/admin/blacklist", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ word: newWord })
      })

      if (!response.ok) {
        throw new Error("Failed to add blacklist word")
      }

      toast({
        title: "Success",
        description: "Word added to blacklist successfully"
      })
      
      setNewWord("")
      fetchBlacklistedWords()
    } catch (error) {
      console.error("Error adding blacklist word:", error)
      toast({
        title: "Error",
        description: "Failed to add blacklist word. Please try again.",
        variant: "destructive"
      })
    } finally {
      setAddingWord(false)
    }
  }

  const handleRemoveBlacklistWord = async (word: string) => {
    try {
      setRemovingWord(word)
      const response = await fetch("https://api.himtalks.my.id/api/admin/blacklist/remove", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ word })
      })

      if (!response.ok) {
        throw new Error("Failed to remove blacklist word")
      }

      const result = await response.json()
      toast({
        title: "Success",
        description: result.message || "Word removed successfully"
      })

      fetchBlacklistedWords()
    } catch (error) {
      console.error("Error removing blacklist word:", error)
      toast({
        title: "Error",
        description: "Failed to remove blacklist word. Please try again.",
        variant: "destructive"
      })
    } finally {
      setRemovingWord(null)
    }
  }

  const handleUpdateSongfessDays = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!songfessDays.trim()) {
      toast({
        title: "Error",
        description: "Number of days is required",
        variant: "destructive"
      })
      return
    }

    try {
      setUpdatingSongfessDays(true)
      const response = await fetch("https://api.himtalks.my.id/api/admin/configSongfessDays", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ days: songfessDays })
      })

      if (!response.ok) {
        throw new Error("Failed to update songfess days")
      }

      toast({
        title: "Success",
        description: "Songfess days limit updated successfully"
      })
      
      // Refresh the current config
      await fetchSongfessDays()
    } catch (error) {
      console.error("Error updating songfess days:", error)
      toast({
        title: "Error",
        description: "Failed to update songfess days. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUpdatingSongfessDays(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-72" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
            <Settings className="h-5 w-5 md:h-6 md:w-6" />
            System Settings
          </CardTitle>
          <CardDescription>Configure system parameters and restrictions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="songfess" className="w-full">
            <TabsList className="mb-4 w-full flex sm:w-auto">
              <TabsTrigger value="songfess" className="flex-1 sm:flex-none">
                <Clock className="mr-2 h-4 w-4" />
                Songfess Settings
              </TabsTrigger>
              <TabsTrigger value="blacklist" className="flex-1 sm:flex-none">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Blacklist Words
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="songfess">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Songfess Duration</CardTitle>
                  <CardDescription>Set the number of days songfess will be available</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Display current setting */}
                  <div className="mb-4 p-3 bg-muted/50 rounded-md flex items-center">
                    <Info className="h-5 w-5 mr-2 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Current setting:</p>
                      <p className="text-lg font-bold">
                        {currentSongfessDays ? `${currentSongfessDays} days` : "Not configured"}
                      </p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleUpdateSongfessDays} className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Number of days"
                      value={songfessDays}
                      onChange={(e) => setSongfessDays(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={updatingSongfessDays}
                      className="w-full sm:w-auto"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {updatingSongfessDays ? "Updating..." : "Update"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="blacklist">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Blacklisted Words</CardTitle>
                  <CardDescription>Add or remove words that will be filtered from messages</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddBlacklistWord} className="flex flex-col sm:flex-row gap-2 mb-6">
                    <Input
                      type="text"
                      placeholder="New blacklisted word"
                      value={newWord}
                      onChange={(e) => setNewWord(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={addingWord}
                      className="w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {addingWord ? "Adding..." : "Add Word"}
                    </Button>
                  </form>

                  {loadingWords ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-9 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : blacklistedWords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <AlertTriangle className="h-12 w-12 mb-2 opacity-50" />
                      <p>No blacklisted words found.</p>
                    </div>
                  ) : (
                    <ScrollArea className="max-h-[300px] pr-4">
                      <div className="space-y-2">
                        {blacklistedWords.map((word, index) => (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/50 rounded-md gap-2"
                          >
                            <div className="font-medium break-words">{word}</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 self-end sm:self-auto"
                              onClick={() => handleRemoveBlacklistWord(word)}
                              disabled={removingWord === word}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {removingWord === word ? "Removing..." : "Remove"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}