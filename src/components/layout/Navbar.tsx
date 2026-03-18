
"use client";

import { useStore } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, Globe, Moon, Sun, Lock, ShieldCheck, LogOut, UserCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFirebase } from "@/firebase";

export function Navbar() {
  const router = useRouter();
  const { auth } = useFirebase();
  const { language, setLanguage, cart, isAuthenticated, customerSession, logout, theme, setTheme } = useStore();
  const t = translations[language as keyof typeof translations] || translations.fr;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Synchronisation de la classe CSS avec le thème du store
  useEffect(() => {
    if (mounted) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    if (auth) await auth.signOut();
    logout();
    router.push("/");
  };

  if (!mounted) return null;

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isUserLoggedIn = isAuthenticated || !!customerSession;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-headline text-white font-bold text-xl">
            R
          </div>
          <span className="font-headline font-bold text-xl tracking-tight hidden sm:inline-block">
            RIAM'S <span className="text-primary">7.16</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">{language === 'fr' ? 'Accueil' : 'Home'}</Link>
          <Link href="/menu" className="text-sm font-medium hover:text-primary transition-colors">{language === 'fr' ? 'Menu' : 'Menu'}</Link>
          <Link href="/track" className="text-sm font-medium hover:text-primary transition-colors">{language === 'fr' ? 'Suivi' : 'Tracking'}</Link>
          {isAuthenticated && (
            <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 text-primary font-bold">
              <ShieldCheck className="h-4 w-4" /> Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('fr')}>Français</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('es')}>Español</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {isUserLoggedIn ? (
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10" 
              onClick={handleLogout}
              title={t.logout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Link href="/auth">
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground" title={t.login_client}>
                  <UserCircle className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground" title="Admin">
                  <Lock className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
