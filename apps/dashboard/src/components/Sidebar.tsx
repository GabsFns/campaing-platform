"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutGrid,
  Users,
  FileText,
  Send,
  BarChart3,
  Settings
} from "lucide-react"

export default function Sidebar() {

  const pathname = usePathname()

  const menuItems = [
  { icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Audiência", href: "/dashboard/audience" },
  { icon: FileText, label: "Templates", href: "/dashboard/templates" },
  { icon: Send, label: "Campanhas", href: "/dashboard/campaigns" },
  { icon: BarChart3, label: "Relatórios", href: "/dashboard/reports" }
]





  return (
    <aside className="w-64 h-screen border-r border-white/5 bg-[#161920] flex flex-col">
      <div className="p-8 flex items-center gap-3">
        {/* Azul Bonito (Royal/Vibrant) no Logo */}
        <div className="w-9 h-9 bg-[#0052ff] rounded-xl shadow-[0_0_20px_rgba(0,82,255,0.4)] flex items-center justify-center">
          <Send size={18} className="text-white"/>
        </div>
        <span className="text-xl font-black tracking-tight uppercase italic text-white">Impecável</span>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
         const isActive =
  item.href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(item.href)
          return (
            <Link key={item.label} href={item.href}
              className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 active:scale-[0.98]
              ${isActive
                ? "bg-white/10 text-[#bae6fd] border border-white/10 shadow-lg" 
                : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={20} className={isActive ? "text-[#bae6fd]" : "group-hover:text-blue-400"} />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#bae6fd] shadow-[0_0_8px_#bae6fd]"/>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}