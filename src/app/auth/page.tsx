
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserCircle, LogIn, Loader2, Phone, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

export default function CustomerLoginPage() {
  const { language, setCustomerSession } = useStore();
  const t = translations[language];
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setIsLoading(true);

    try {
      // Recherche du profil client existant par téléphone
      const customersRef = collection(firestore, 'customers');
      const q = query(customersRef, where('phoneNumber', '==', formData.phone), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const customerDoc = querySnapshot.docs[0];
        const customerData = customerDoc.data();
        
        setCustomerSession({
          name: customerData.name,
          phone: customerData.phoneNumber,
          id: customerDoc.id
        });

        toast({
          title: "Session restaurée",
          description: `Ravi de vous revoir, ${customerData.name} !`
        });
        
        router.push("/track");
      } else {
        toast({
          variant: "destructive",
          title: "Compte non trouvé",
          description: "Nous n'avons trouvé aucune commande liée à ce numéro."
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la récupération."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 pt-20">
      <Navbar />
      <div className="w-full max-w-md px-4">
        <Card className="border-none shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <UserCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline font-bold">{t.login_client}</CardTitle>
            <CardDescription>{t.login_client_desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.full_name}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="name" 
                      placeholder="Jean Dupont" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="pl-10 h-12"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.phone}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      placeholder="+229..." 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="pl-10 h-12"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 gap-2" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
                {t.find_orders}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
