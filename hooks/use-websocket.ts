"use client"

import { useState, useEffect, useRef } from "react"

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<any>(null)
  const webSocketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // Add a small delay to make sure authentication is completed first
    const timer = setTimeout(() => {
      if (!url) return;
      
      // Create WebSocket connection
      const ws = new WebSocket(url);
      webSocketRef.current = ws

      ws.onopen = () => {
        console.log("WebSocket connected")
        setIsConnected(true)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastMessage(data)
        } catch (error) {
          console.log("Received non-JSON message:", event.data)
          setLastMessage(event.data)
        }
      }

      ws.onerror = (error) => {
        // Silently handle WebSocket errors as they are expected if the backend
        // doesn't have WebSocket endpoints fully implemented yet.
        // The browser will still log a native connection error, which is normal.
      }

      ws.onclose = () => {
        console.log("WebSocket connection closed")
        setIsConnected(false)
      }
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, [url])

  // Function to send messages
  const sendMessage = (data: any) => {
    if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(JSON.stringify(data))
    } else {
      console.error("WebSocket is not connected")
    }
  }

  return { isConnected, lastMessage, sendMessage }
}

