"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    LayoutDashboard,
    Image as ImageIcon,
    MessageSquare,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CXMediaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        { name: "Overview", href: "/dashboard/cx-media", icon: LayoutDashboard },
        { name: "Gallery Review", href: "/dashboard/cx-media/gallery", icon: ImageIcon },
        { name: "Support", href: "/dashboard/cx-media/support", icon: MessageSquare },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Header */}
            <div className="flex h-16 items-center justify-between border-b bg-card px-4 md:hidden">
                <div className="font-bold">CX Dashboard</div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </Button>
            </div>

            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-card transition-transform duration-200 md:static md:translate-x-0",
                        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <div className="flex h-full flex-col">
                        <div className="flex h-16 items-center px-6 font-bold text-xl tracking-tight">
                            PYRARIDE <span className="ml-2 text-xs font-normal text-muted-foreground">CX</span>
                        </div>

                        <div className="flex-1 space-y-1 px-3 py-4">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="border-t p-4">
                            <div className="flex items-center gap-3 px-2 py-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10" />
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate text-sm font-medium">{session?.user?.name}</p>
                                    <p className="truncate text-xs text-muted-foreground">{session?.user?.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
