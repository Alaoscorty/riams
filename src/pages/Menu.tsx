import { Navbar } from "@/components/layout/Navbar";
import { useStore } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Plus, Loader2, UtensilsCrossed, Ban, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";

export default function MenuPage() {
  const { language, addToCart } = useStore();
  const { firestore } = useFirebase();
  const t = translations[language];
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState('all');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dishesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const baseQuery = collection(firestore, 'dishes');
    
    if (activeCategory !== 'all') {
      return query(baseQuery, where('category', '==', activeCategory));
    }
    
    return query(baseQuery, orderBy('name', 'asc'));
  }, [firestore, activeCategory]);

  const { data: dishes, isLoading, error } = useCollection(dishesQuery);

  const categories = [
    { id: 'all', name: 'Tout' },
    { id: 'grillades', name: t.categories.grillades },
    { id: 'poissons', name: t.categories.poissons },
    { id: 'burgers', name: t.categories.burgers },
    { id: 'snacks', name: t.categories.snacks },
    { id: 'boissons', name: t.categories.boissons },
    { id: 'cocktails', name: t.categories.cocktails },
  ];

  const handleAddToCart = (item: any) => {
    if (!item.isAvailable) return;
    
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.imageUrl,
      quantity: 1
    });
    toast({
      title: "Ajouté au panier",
      description: `${item.name} a été ajouté à votre panier.`
    });
  };

  if (!isMounted) return null;

  return (
    <main className="min-h-screen pt-24 pb-12 bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-headline font-black mb-4">Notre Menu</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos créations culinaires préparées avec passion et des ingrédients de première qualité.
          </p>
        </header>

        <div className="flex overflow-x-auto pb-6 mb-12 gap-2 no-scrollbar">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              className={cn(
                "rounded-full px-6 whitespace-nowrap",
                activeCategory === cat.id ? "bg-primary" : "hover:border-primary hover:text-primary"
              )}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="font-bold">Chargement de la carte...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-destructive/5 rounded-3xl border border-destructive/10">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
            <p className="font-bold text-destructive text-lg">Oups ! Une erreur est survenue.</p>
            <p className="text-sm text-muted-foreground mt-2">Nous n'avons pas pu charger le menu. Veuillez rafraîchir la page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {dishes?.map((item) => (
              <Card key={item.id} className={cn(
                "group overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 relative",
                !item.isAvailable && "opacity-60"
              )}>
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-background/40 z-10 flex items-center justify-center pointer-events-none">
                    <Badge variant="destructive" className="h-12 px-6 text-lg font-black uppercase rotate-[-10deg] shadow-2xl">
                      <Ban className="mr-2 h-5 w-5" /> Épuisé
                    </Badge>
                  </div>
                )}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute top-4 right-4 z-20">
                    <Badge className="bg-white/80 backdrop-blur-md text-primary font-bold">
                      {item.price.toLocaleString()} FCFA
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl font-headline font-bold line-clamp-1">{item.name}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                    {item.description}
                  </p>
                </CardHeader>
                <CardFooter className="p-6 pt-0">
                  <Button 
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-full gap-2"
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.isAvailable}
                  >
                    <Plus className="h-4 w-4" /> {t.cart}
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {(!dishes || dishes.length === 0) && (
              <div className="col-span-full py-20 text-center bg-muted/30 rounded-3xl border-2 border-dashed">
                <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-muted-foreground">Aucun produit trouvé</h3>
                <p className="text-muted-foreground mt-2">Il n'y a pas encore de plats disponibles dans cette catégorie.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
