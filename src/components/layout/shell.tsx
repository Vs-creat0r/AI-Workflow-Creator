
import { Sidebar, sidebarItems } from "./sidebar"
import { Outlet, Link, useLocation } from "react-router-dom"
import { ToastContainer } from "@/components/ui/toast-container"
import { useState, useRef } from "react"
import { Menu, X, Network as NetworkIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function Shell() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = useLocation()

    // Swipe Gesture Handling
    const touchStart = useRef<number | null>(null)
    const touchEnd = useRef<number | null>(null)

    const onTouchStart = (e: React.TouchEvent) => {
        touchEnd.current = null
        touchStart.current = e.targetTouches[0].clientX
    }

    const onTouchMove = (e: React.TouchEvent) => {
        touchEnd.current = e.targetTouches[0].clientX
    }

    const onTouchEnd = () => {
        if (!touchStart.current || !touchEnd.current) return
        const distance = touchStart.current - touchEnd.current
        const isLeftSwipe = distance > 50
        const isRightSwipe = distance < -50

        if (isLeftSwipe && isMobileMenuOpen) {
            setIsMobileMenuOpen(false) // Close on swipe left
        }
        if (isRightSwipe && !isMobileMenuOpen) {
            setIsMobileMenuOpen(true) // Open on swipe right
        }
    }

    return (
        <div
            className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-foreground overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <Sidebar />

            <main className="flex-1 h-full relative overflow-hidden flex flex-col">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 border-b bg-white/50 dark:bg-black/20 backdrop-blur-md z-50 transition-all duration-300">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-purple-600 text-white">
                            <NetworkIcon className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-lg">Workflow AI</span>
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -mr-2 text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-[60] md:hidden">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Drawer */}
                        <div className="absolute top-0 right-0 bottom-0 w-[280px] bg-background border-l shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300">
                            <div className="flex items-center justify-between mb-8">
                                <span className="font-semibold text-lg">Menu</span>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 -mr-2 text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="flex flex-col gap-2">
                                {sidebarItems.map((item) => {
                                    const isActive = location.pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            to={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-95",
                                                isActive
                                                    ? "bg-primary/10 text-primary font-medium"
                                                    : "text-muted-foreground hover:bg-muted"
                                            )}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            {item.title}
                                        </Link>
                                    )
                                })}
                            </nav>

                            <div className="mt-auto text-center text-xs text-muted-foreground">
                                Swipe right to open • Left to close
                            </div>
                        </div>
                    </div>
                )}

                {/* Decorative background gradients */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
                </div>

                <div className="relative z-10 flex-1 h-full w-full overflow-hidden">
                    <Outlet />
                    <ToastContainer />
                </div>
            </main>
        </div>
    )
}
