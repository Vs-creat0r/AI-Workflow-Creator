import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Bot, Network, LayoutDashboard, Clock, Settings, Network as NetworkIcon } from "lucide-react"

export const sidebarItems = [
    {
        title: "Chat Agent",
        icon: Bot,
        href: "/",
    },
    {
        title: "Visualizer",
        icon: Network,
        href: "/visualizer",
    },
    {
        title: "Templates",
        icon: LayoutDashboard,
        href: "/templates",
    },
    {
        title: "History",
        icon: Clock,
        href: "/history",
    },
    {
        title: "Settings",
        icon: Settings,
        href: "/settings",
    },
]

export function Sidebar() {
    const location = useLocation()

    return (
        <div className="hidden border-r bg-white/50 backdrop-blur-xl dark:bg-black/20 dark:border-white/10 md:flex w-[80px] flex-col h-full items-center py-6 gap-6 transition-all duration-300 z-50">
            {/* Logo Area */}
            <div className="mb-4">
                <Link to="/" className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 text-white shadow-lg shadow-primary/25 hover:scale-105 transition-transform duration-300">
                    <NetworkIcon className="h-6 w-6" />
                </Link>
            </div>

            {/* Navigation Items */}
            <nav className="flex flex-col gap-3 w-full px-2 items-center flex-1">
                {sidebarItems.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className="relative group"
                        >
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-sm"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}>
                                <item.icon className={cn("h-5 w-5 transition-transform duration-300", isActive && "scale-110")} />
                            </div>

                            {/* Tooltip (optional improvement) */}
                            <div className="absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 border">
                                {item.title}
                            </div>

                            {/* Active Indicator */}
                            {isActive && (
                                <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Actions (User/Profile could go here) */}
            <div className="mt-auto">
                {/* Placeholder for future user profile */}
            </div>
        </div>
    )
}
