
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useStore } from "@/lib/store";
import { translations } from "@/lib/translations";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Loader2, ArrowRight, Clock, MapPin, DollarSign, ListChecks } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function JobsPage() {
  const { language } = useStore();
  const t = translations[language as keyof typeof translations] || translations.fr;
  const { firestore } = useFirebase();

  const jobsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'jobs'), where('isAvailable', '==', true), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: jobs, isLoading } = useCollection(jobsQuery);

  return (
    <main className="min-h-screen pt-24 pb-12 bg-muted/20">
      <Navbar />
      <div className="container mx-auto px-4">
        <header className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full text-primary mb-2">
            <Briefcase className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-black">{t.job_offers}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t.job_offers_subtitle}</p>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.map((job) => (
              <Card key={job.id} className="group border-none shadow-xl hover:shadow-2xl transition-all duration-300 rounded-[2rem] overflow-hidden bg-card">
                <CardHeader className="bg-primary/5 p-8">
                  <Badge variant="outline" className="w-fit mb-4 border-primary/20 text-primary bg-primary/5 font-bold">
                    Porto-Novo
                  </Badge>
                  <CardTitle className="text-2xl font-headline font-bold text-foreground group-hover:text-primary transition-colors">
                    {job.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                    {job.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground pt-2">
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Temps Plein</span>
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Lounge</span>
                  </div>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 gap-2 font-bold text-lg">
                        {t.view_details} <ArrowRight className="h-5 w-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem]">
                      <DialogHeader>
                        <DialogTitle className="text-3xl font-headline font-black text-primary border-b pb-4 mb-6">
                          {job.title}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-8 py-2">
                        <section className="space-y-3">
                          <h4 className="flex items-center gap-2 font-black text-lg text-foreground">
                            <Briefcase className="h-5 w-5 text-primary" /> {t.job_desc}
                          </h4>
                          <p className="text-muted-foreground leading-relaxed italic">{job.description}</p>
                        </section>

                        {job.requirements && (
                          <section className="space-y-3">
                            <h4 className="flex items-center gap-2 font-black text-lg text-foreground">
                              <ListChecks className="h-5 w-5 text-secondary" /> {t.job_reqs}
                            </h4>
                            <p className="text-muted-foreground whitespace-pre-wrap bg-muted/30 p-4 rounded-2xl border border-dashed">{job.requirements}</p>
                          </section>
                        )}

                        <section className="bg-accent/5 p-6 rounded-3xl border border-accent/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-accent/10 p-3 rounded-full text-accent">
                              <DollarSign className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t.salary}</p>
                              <p className="text-xl font-black">{job.salary || "À négocier"}</p>
                            </div>
                          </div>
                          <Button asChild className="rounded-full px-8 bg-accent hover:bg-accent/90 text-accent-foreground font-black">
                            <a href="https://wa.me/22997000000" target="_blank">Postuler via WhatsApp</a>
                          </Button>
                        </section>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-[3rem] shadow-xl border-2 border-dashed border-primary/10">
            <Briefcase className="h-16 w-16 text-primary/10 mx-auto mb-6" />
            <p className="text-xl font-headline font-bold text-muted-foreground">{t.no_jobs}</p>
          </div>
        )}
      </div>
    </main>
  );
}
