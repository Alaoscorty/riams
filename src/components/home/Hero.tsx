
"use client";

import { useStore } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, History, ShieldCheck } from "lucide-react";

export function Hero() {
  const { language, isAuthenticated, customerSession } = useStore();
  const t = translations[language as keyof typeof translations] || translations.fr;
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-restaurant');

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        {heroImage?.imageUrl && (
          <Image 
            src={heroImage.imageUrl} 
            alt="Restaurant Hero" 
            fill 
            className="object-cover brightness-50"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20" />
      </div>

      <div className="container relative z-10 text-center px-4">
        <h1 className="text-5xl md:text-8xl font-headline font-black text-white mb-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          RIAM'S <span className="text-primary italic">7.16</span> LOUNGE
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          {t.hero_subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 py-7 text-lg shadow-lg gap-2">
              <Link href="/admin"><ShieldCheck className="h-5 w-5" /> {t.admin_dashboard}</Link>
            </Button>
          ) : customerSession ? (
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 py-7 text-lg shadow-lg gap-2">
              <Link href="/track"><History className="h-5 w-5" /> {t.view_my_orders}</Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 py-7 text-lg shadow-lg gap-2">
              <Link href="/menu"><ShoppingBag className="h-5 w-5" /> {t.order_now}</Link>
            </Button>
          )}
          <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 rounded-full px-10 py-7 text-lg backdrop-blur-sm">
            <Link href="/menu">{t.view_menu}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
