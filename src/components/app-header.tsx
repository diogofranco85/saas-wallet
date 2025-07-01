"use client"

import * as React from "react"
import { useCallback, useEffect, useState } from "react"
import { Search, Bell, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface INotifications {
  id: string
  userId: string;
  touched: boolean;
  title: string;
  message: string;
  created_at: string
}

export function AppHeader() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [messages, setMessages] = useState<INotifications[]>([])

  useEffect(() => {
    if (messages.length === 0) {
      realtimeNotifications()
    }
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const loadNotification = async () => {

    try {
      const response = await fetch("/api/notifications?page=1&limit=10", { method: "GET" })

      if (!response.ok) {
        toast.error("Notificações", { description: "Error ao carregar as notificações" })
        return;
      }

      const { notifications } = await response.json();

      setMessages(notifications);
    } catch (error: any) {
      toast.error("Notificações", { description: error.message })
    }
  }

  const realtimeNotifications = useCallback(async () => {
    await loadNotification()

    const channels = supabase.channel('realtime:notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session?.user.id}`
        },
        (payload) => {
          console.log('Change received!', payload)
        }
      )
      .subscribe()

    return () => {
      channels.unsubscribe()
    }
  }, [])

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      {/* Search */}
      <div className="flex flex-1 items-center gap-2">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar cobranças, clientes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">{messages.length}</Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {messages.map((message) => {
              return (
                <DropdownMenuItem key={message.id}>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{message.title}</p>
                    <p className="text-xs text-muted-foreground">{message.message}</p>
                  </div>
                </DropdownMenuItem>
              )
            })}


            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center">
              <Link href="/dashboard/notifications" className="w-full">
                Ver todas as notificações
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(session?.user?.name || "U")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/company">
                <Settings className="mr-2 h-4 w-4" />
                <span>Empresa</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
