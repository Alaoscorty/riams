
"use client";

import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";

export function HomeGallery() {
  const { firestore } = useFirebase();

  const galleryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'gallery'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: images, isLoading } = useCollection(galleryQuery);

  if (isLoading) {
    return (
      <div className="h-[500px] w-full flex items-center justify-center bg-muted/20 rounded-2xl">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl bg-muted flex flex-col items-center justify-center border-4 border-dashed border-primary/10">
        <ImageIcon className="h-16 w-16 text-primary/10 mb-4" />
        <p className="text-muted-foreground font-bold">Découvrez RIAM'S prochainement</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Decorative Motifs */}
      <div className="absolute -top-4 -left-4 w-24 h-24 border-t-4 border-l-4 border-accent rounded-tl-3xl z-10 opacity-50" />
      <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-4 border-r-4 border-secondary rounded-br-3xl z-10 opacity-50" />
      
      <Carousel 
        plugins={[Autoplay({ delay: 3000, stopOnInteraction: false })]}
        className="w-full"
      >
        <CarouselContent>
          {images.map((img, idx) => (
            <CarouselItem key={img.id}>
              <div className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl group/item">
                <img 
                  src={img.imageUrl} 
                  alt={img.description || "RIAM'S Lounge"} 
                  className="object-cover w-full h-full transition-transform duration-700 group-hover/item:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {img.description && (
                  <div className="absolute bottom-8 left-8 text-white max-w-md animate-in fade-in slide-in-from-bottom-4">
                    <p className="text-xl font-headline font-bold drop-shadow-lg">{img.description}</p>
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden group-hover:block transition-all">
          <CarouselPrevious className="left-4 bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/40" />
          <CarouselNext className="right-4 bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/40" />
        </div>
      </Carousel>

      {/* Modern Overlay Pattern */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl border-[12px] border-white/5 backdrop-contrast-125" />
    </div>
  );
}
