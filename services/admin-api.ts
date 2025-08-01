const API_BASE = "https://api.himtalks.my.id";

export async function fetchAdminList() {
  try {
    const response = await fetch(`${API_BASE}/api/admin/list`, {
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch admins");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching admins:", error);
    throw error;
  }
}

export async function addAdmin(email: string) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/addAdmin`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      throw new Error("Failed to add admin");
    }

    return true;
  } catch (error) {
    console.error("Error adding admin:", error);
    throw error;
  }
}

export async function removeAdmin(id: string) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/removeAdmin`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id })
    });

    if (!response.ok) {
      throw new Error("Failed to remove admin");
    }

    return await response.json();
  } catch (error) {
    console.error("Error removing admin:", error);
    throw error;
  }
}

export async function fetchBlacklist() {
  try {
    const response = await fetch(`${API_BASE}/api/admin/blacklist`, {
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch blacklist");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching blacklist:", error);
    throw error;
  }
}

export async function addBlacklistWord(word: string) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/blacklist`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ word })
    });

    if (!response.ok) {
      throw new Error("Failed to add blacklist word");
    }

    return true;
  } catch (error) {
    console.error("Error adding blacklist word:", error);
    throw error;
  }
}

export async function removeBlacklistWord(word: string) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/blacklist/remove`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ word })
    });

    if (!response.ok) {
      throw new Error("Failed to remove blacklist word");
    }

    return await response.json();
  } catch (error) {
    console.error("Error removing blacklist word:", error);
    throw error;
  }
}

export async function updateSongfessDays(days: string) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/configSongfessDays`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ days })
    });

    if (!response.ok) {
      throw new Error("Failed to update songfess days");
    }

    return true;
  } catch (error) {
    console.error("Error updating songfess days:", error);
    throw error;
  }
}