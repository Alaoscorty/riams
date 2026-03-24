import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { CategoryCard } from "@/components/home/Categorycard";
import { translations } from "@/lib/translations";
import { useStore } from "@/lib/store";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ChatAssistant } from "@/components/ai/ChatAssistant";
import { MapPin, Clock, Phone, Mail, Briefcase } from "lucide-react";
import { HomeGallery } from "@/components/home/HomeGallery";
import { EmployeesSection } from "@/components/home/EmployeesSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { language } = useStore();
  const t = translations[language as keyof typeof translations] || translations.fr;

  const categories = [
    { id: 'grillades', name: t.categories.grillades, image: PlaceHolderImages.find(i => i.id === 'dish-grillade')?.imageUrl || "" },
    { id: 'poissons', name: t.categories.poissons, image: PlaceHolderImages.find(i => i.id === 'dish-fish')?.imageUrl || "" },
    { id: 'burgers', name: t.categories.burgers, image: PlaceHolderImages.find(i => i.id === 'dish-burger')?.imageUrl || "" },
    { id: 'cocktails', name: t.categories.cocktails, image: PlaceHolderImages.find(i => i.id === 'dish-cocktail')?.imageUrl || "" },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      
      {/* Categories Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-headline font-bold mb-4">{language === 'fr' ? 'Nos Spécialités' : 'Our Specialties'}</h2>
            <div className="w-20 h-1 bg-primary mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} {...cat} />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-muted/50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 w-full">
              <HomeGallery />
            </div>
            <div className="lg:w-1/2 space-y-8">
              <div className="space-y-2">
                <span className="text-primary font-bold tracking-widest uppercase text-sm">Découvrez l'expérience</span>
                <h2 className="text-5xl font-headline font-black leading-tight">RIAM'S 7.16 LOUNGE</h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed italic">
                "Situé à Porto-Novo, quartier Dowa-Dédomin, juste à côté du Carrefour Gandaho, 
                notre lounge est une véritable oasis de plaisir culinaire. Nous allions modernité 
                et saveurs traditionnelles pour vous offrir une expérience inoubliable."
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-primary/10 p-3 rounded-xl text-primary"><MapPin className="h-6 w-6" /></div>
                  <div><h4 className="font-bold mb-1">Localisation</h4><p className="text-xs text-muted-foreground">Porto-Novo, Dowa-Dédomin</p></div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-primary/10 p-3 rounded-xl text-primary"><Clock className="h-6 w-6" /></div>
                  <div><h4 className="font-bold mb-1">Horaires</h4><p className="text-xs text-muted-foreground">Lun - Dim: 10h00 - 02h00</p></div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-primary/10 p-3 rounded-xl text-primary"><Phone className="h-6 w-6" /></div>
                  <div><h4 className="font-bold mb-1">Téléphone</h4><p className="text-xs text-muted-foreground">+229 97 00 00 00</p></div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-primary/10 p-3 rounded-xl text-primary"><Mail className="h-6 w-6" /></div>
                  <div><h4 className="font-bold mb-1">Email</h4><p className="text-xs text-muted-foreground">contact@riams716.com</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Employees Section */}
      <EmployeesSection />

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8">
            <span className="font-headline font-bold text-2xl tracking-tight">
              RIAM'S <span className="text-primary">7.16</span> LOUNGE
            </span>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            La destination premium pour les gourmets à Porto-Novo. Cuisine raffinée et cocktails signature.
          </p>
          <div className="flex justify-center flex-wrap gap-4 mb-8">
            <Button asChild variant="outline" className="rounded-full border-primary text-primary hover:bg-primary/5 font-bold gap-2">
              <Link to="/jobs"><Briefcase className="h-4 w-4" /> {t.job_offers}</Link>
            </Button>
            {['Facebook', 'Instagram', 'WhatsApp'].map((social) => (
              <a key={social} href="#" className="flex items-center text-muted-foreground hover:text-primary transition-colors font-medium h-10 px-4">
                {social}
              </a>
            ))}
          </div>
          <div className="text-sm text-muted-foreground pt-8 border-t">
            &copy; {new Date().getFullYear()} RIAM'S 7.16 LOUNGE. All rights reserved.
          </div>
        </div>
      </footer>

      <ChatAssistant />
    </main>
  );
}
