import { type NextRequest, NextResponse } from "next/server"

// Add paths that require authentication
const PROTECTED_PATHS = ["/dashboard"]

// Add paths that require admin role
const ADMIN_PATHS = ["/dashboard"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path requires authentication
  const isProtectedPath = PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  // Check if the path requires admin role
  const isAdminPath = ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  if (isProtectedPath) {
    try {
      // Check authentication status
      const response = await fetch("https://api.himtalks.my.id/api/protected", {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      })

      if (!response.ok) {
        // Not authenticated, redirect to login
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // Get user data
      const data = await response.json()

      // Check if admin path requires admin role
      if (isAdminPath && !data.user.isAdmin) {
        // Redirect non-admin users to messages page
        return NextResponse.redirect(new URL("/messages", request.url))
      }
    } catch (error) {
      // Error checking auth, redirect to login
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Add paths that should be checked by the middleware
    "/dashboard/:path*",
  ],
}

