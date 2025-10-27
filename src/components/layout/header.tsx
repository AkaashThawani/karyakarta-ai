"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useAuthModal } from "@/hooks/use-auth-modal";

interface HeaderProps {
  onNewSession?: () => void;
  showNewChat?: boolean;
}

export function Header({ onNewSession, showNewChat = false }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { openModal } = useAuthModal();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo and Brand - Clickable */}
        <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold gradient-text">KaryaKarta AI</h1>
            <p className="text-xs text-muted-foreground">Intelligent Assistant</p>
          </div>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* New Session Button */}
          {showNewChat && onNewSession && (
            <Button
              onClick={onNewSession}
              variant="outline"
              size="sm"
              className="hidden sm:flex gap-2"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          )}

          {/* Login Button - Only show if not authenticated and not on auth pages */}
          {!user && !isAuthPage && (
            <Button 
              onClick={() => openModal('login')}
              size="sm" 
              className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          )}

          {/* Sign Out Button - Only show if authenticated */}
          {user && (
            <Button 
              onClick={async () => {
                await signOut();
                router.push('/');
              }}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
