const API_BASE = "http://localhost:8080";

export async function deleteMessage(id: string) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/message/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // This ensures cookies are sent with the request
      body: JSON.stringify({ id: Number(id) })
    });
    
    if (!res.ok) {
      console.error(`Failed to delete message: ${res.status}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    return false;
  }
}

export async function deleteSongfess(id: string) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/songfess/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // This ensures cookies are sent with the request
      body: JSON.stringify({ id: Number(id) })
    });
    
    if (!res.ok) {
      console.error(`Failed to delete songfess: ${res.status}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting songfess:', error);
    return false;
  }
}

export async function fetchMessages() {
  try {
    const response = await fetch(`${API_BASE}/api/admin/messages`, {
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch messages");
    }
    
    // Handle the response
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const data = await response.json();
      
      // More thorough sanitization of date fields
      if (Array.isArray(data)) {
        return data.map(item => ({
          ...item,
          // Set default values for missing timestamps and validate existing ones
          createdAt: sanitizeDate(item.createdAt),
          updatedAt: sanitizeDate(item.updatedAt),
        }));
      }
      
      return data;
    } else {
      const text = await response.text();
      console.log("Received text response:", text);
      return [];
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    return []; // Return empty array instead of throwing
  }
}

// Helper function to sanitize dates
function sanitizeDate(value: any): string | null {
  if (!value) return null;
  
  try {
    // For numeric timestamps
    if (typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date.toISOString();
    }
    
    // For string dates
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date.toISOString();
    }
    
    return null;
  } catch (error) {
    console.error("Date sanitization error:", error);
    return null;
  }
}

export async function fetchSongfess() {
  try {
    // First try the primary endpoint
    const response = await fetch(`${API_BASE}/api/admin/songfessAll`, {
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
    })

    if (!response.ok) {
      console.log("Primary songfess endpoint failed, trying fallback...")
      
      // If first endpoint fails, try the fallback endpoint
      const fallbackResponse = await fetch(`${API_BASE}/api/admin/songfess`, {
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      })
      
      if (!fallbackResponse.ok) {
        throw new Error("Failed to fetch songfess from both endpoints")
      }
      
      return await fallbackResponse.json()
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching songfess:", error)
    throw error
  }
}

export async function fetchSongfessById(id: string) {
  try {
    const response = await fetch(`${API_BASE}/songfess/${id}`, {
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      // If first endpoint fails, try the fallback endpoint
      const fallbackResponse = await fetch(`${API_BASE}/api/admin/songfessAll/${id}`, {
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      });
      
      if (!fallbackResponse.ok) {
        throw new Error("Failed to fetch songfess details");
      }
      
      return await fallbackResponse.json();
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching songfess details:", error);
    throw error;
  }
}

