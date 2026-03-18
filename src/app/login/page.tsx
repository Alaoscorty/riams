
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, LogIn, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const login = useStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Vérification du code secret uniquement
    const success = login(code);
    
    if (success) {
      router.push("/admin");
    } else {
      setError("Le code secret saisi est incorrect.");
      setCode("");
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
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline font-bold">Accès Admin</CardTitle>
            <CardDescription>Entrez votre code secret pour gérer RIAM'S</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur d'accès</AlertTitle>
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code">Code Secret</Label>
                <Input 
                  id="code" 
                  type="password" 
                  placeholder="Code d'accès" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-14 text-center text-2xl tracking-widest font-bold"
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 gap-2 text-lg font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
                Se Connecter
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
