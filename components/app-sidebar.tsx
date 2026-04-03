"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { MessageSquare, Music, LayoutDashboard, LogOut, LogIn, Users, Settings as SettingsIcon, MessageCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { useLoginModal } from "@/hooks/use-login-modal"

export default function AppSidebar() {
  const pathname = usePathname()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { showLoginModal } = useLoginModal()

  const handleLoginClick = () => {
    showLoginModal("Sign in with your student.unsika.ac.id email to access all features")
  }

  return (
    <Sidebar>
      <SidebarHeader className="pb-6">
        {isAuthenticated && user ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar>
                  <AvatarImage src={user.picture ?? "/placeholder.svg?height=40&width=40"} alt={user.name || user.email || ""} />
                  <AvatarFallback>{(user.name || user.email)?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{user.name || "UNSIKA Student"}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLoginClick}>
                <Avatar>
                  <AvatarFallback>?</AvatarFallback>
                </Avatar>
                <span>Sign In</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                <Link href="/dashboard" className="flex items-center gap-3">
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/messages"}>
              <Link href="/messages" className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5" />
                <span>Messages</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/songfess"}>
              <Link href="/songfess" className="flex items-center gap-3">
                <Music className="h-5 w-5" />
                <span>Songfess</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {isAuthenticated && isAdmin && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/forum"}>
                  <Link href="/forum" className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5" />
                    <span>Forum</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin-list"}>
                  <Link href="/admin-list" className="flex items-center gap-3">
                    <Users className="h-5 w-5" />
                    <span>Admin List</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/settings"}>
                  <Link href="/settings" className="flex items-center gap-3">
                    <SettingsIcon className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        {isAuthenticated ? (
          <Button variant="ghost" className="w-full justify-start" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        ) : (
          <Button variant="ghost" className="w-full justify-start" onClick={handleLoginClick}>
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
