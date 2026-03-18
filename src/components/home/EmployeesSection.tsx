
"use client";

import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Loader2, Users } from "lucide-react";
import { translations } from "@/lib/translations";
import { useStore } from "@/lib/store";

export function EmployeesSection() {
  const { language } = useStore();
  const t = translations[language as keyof typeof translations] || translations.fr;
  const { firestore } = useFirebase();

  const employeesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'employees'), orderBy('createdAt', 'desc')) : null, [firestore]);
  const { data: employees, isLoading } = useCollection(employeesQuery);

  if (isLoading) return <div className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" /></div>;
  if (!employees || employees.length === 0) return null;

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20 space-y-4">
          <Badge variant="outline" className="rounded-full px-6 py-1.5 border-primary/30 text-primary font-black uppercase tracking-widest text-[10px] bg-primary/5">
            <Users className="h-3 w-3 mr-2" /> {t.employees}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-headline font-black leading-tight">L'Équipe de RIAM'S</h2>
          <div className="w-24 h-1.5 bg-accent mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 justify-center">
          {employees.map((emp) => (
            <div key={emp.id} className="group flex flex-col items-center text-center space-y-6">
              <div className="relative h-44 w-44 rounded-full overflow-hidden border-4 border-accent shadow-2xl transition-all duration-500 group-hover:border-primary group-hover:scale-105 bg-muted">
                {emp.imageUrl ? (
                  <img src={emp.imageUrl} alt={emp.name} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User className="h-16 w-16 text-muted-foreground/20" /></div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-headline font-black group-hover:text-primary transition-colors">{emp.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]">{emp.description}</p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <div className="bg-primary/10 p-2 rounded-full text-primary"><Phone className="h-4 w-4" /></div>
                  <span className="text-sm font-black">{emp.contact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
