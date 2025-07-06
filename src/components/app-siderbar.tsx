"use client"

import type * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  BarChart3,
  Building,
  CreditCard,
  Home,
  Settings,
  Users,
  Wallet,
  FileText,
  HelpCircle,
  ChevronRight,
  ArrowUpRightFromSquare,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useSession } from "next-auth/react"

// Menu items baseados na funcionalidade do PixWallet
const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Carteira",
    icon: Wallet,
    items: [
      {
        title: "Visão Geral",
        url: "/dashboard/wallet",
      },
      {
        title: "Transações",
        url: "/dashboard/wallet/transactions",
      },
      {
        title: "Saques",
        url: "/dashboard/wallet/withdrawals",
      },
    ],
  },
  {
    title: "Cobranças PIX",
    icon: CreditCard,
    items: [
      {
        title: "Todas as Cobranças",
        url: "/dashboard/charges",
      },
      {
        title: "Nova Cobrança",
        url: "/dashboard/charges/new",
      },
    ],
  },
  {
    title: "Equipe",
    icon: Users,
    items: [
      {
        title: "Membros",
        url: "/dashboard/team",
      },
      {
        title: "Convites",
        url: "/dashboard/team/invitations",
      },
      {
        title: "Atividades",
        url: "/dashboard/team/activity",
      },
    ],
  },
  {
    title: "Relatórios",
    icon: BarChart3,
    items: [
      {
        title: "Visão Geral",
        url: "/dashboard/reports",
      },
      {
        title: "Receitas",
        url: "/dashboard/reports/revenue",
      },
      {
        title: "Performance",
        url: "/dashboard/reports/performance",
      },
    ],
  },
  {
    title: "Empresa",
    icon: Building,
    items: [
      {
        title: "Perfil",
        url: "/dashboard/company",
      },
      {
        title: "Planos",
        url: "/dashboard/company/plans",
      },
      {
        title: "Faturamento",
        url: "/dashboard/company/billing",
      },
    ],
  },
]

const settingsItems = [
  {
    title: "Configurações",
    url: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Gateway de Pagamento",
    url: "/dashboard/payment-gateway",
    icon: CreditCard,
  },
  {
    title: "Perfil",
    url: "/dashboard/profile",
    icon: FileText,
  },
  {
    title: "Ajuda",
    url: "/dashboard/help",
    icon: HelpCircle,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="grid flex-1 text-left text-sm leading-tight">
            <div className="flex justify-center my-4">
              <ArrowUpRightFromSquare className="mr-3 text-pink-600" size={36} />
              <p className="flex text-gray-800 text-2xl">
                Hype pay
              </p>
            </div>
            <span className="text-center truncate text-xs text-muted-foreground">{session?.user?.company?.name || "Empresa"}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-pink-700 text-md">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible
                      asChild
                      defaultOpen={item.items.some((subItem) => pathname === subItem.url)}
                      className="group/collapsible "
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                  <Link href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton tooltip={item.title} asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Configurações */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-pink-700 text-md">Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-xs text-muted-foreground">
                  Plano: {session?.user?.company?.plan_id || "Starter"}
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
