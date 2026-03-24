import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'bot';
  content: string;
}

// Simple FAQ responses without Genkit
const faqResponses: Record<string, string> = {
  "horaire": "Nous sommes ouverts tous les jours de 10h00 à 02h00 du matin !",
  "adresse": "Nous sommes situés à Porto-Novo, quartier Dowa-Dédomin, juste à côté du Carrefour Gandaho.",
  "téléphone": "Vous pouvez nous appeler au +229 97 00 00 00.",
  "réservation": "Pour une réservation, veuillez nous contacter directement par téléphone ou WhatsApp.",
  "menu": "Consultez notre menu en cliquant sur l'onglet Menu. Nous proposons grillades, poissons, burgers, snacks, boissons et cocktails.",
  "livraison": "Oui, nous livrons dans les zones de Dowa, Djassin et Ouando !",
  "paiement": "Nous acceptons les paiements par Mobile Money.",
  "default": "Merci pour votre message ! Pour plus d'informations, veuillez nous contacter au +229 97 00 00 00 ou visiter notre menu."
};

function getBotResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  for (const [keyword, response] of Object.entries(faqResponses)) {
    if (keyword !== "default" && lowerMessage.includes(keyword)) {
      return response;
    }
  }
  return faqResponses.default;
}

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: "Bonjour ! Je suis l'assistant RIAM'S. Comment puis-je vous aider aujourd'hui ?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      // Simulate response delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = getBotResponse(userMsg);
      setMessages(prev => [...prev, { role: 'bot', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', content: "Désolé, je rencontre un problème. Veuillez réessayer plus tard." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <Button 
          onClick={() => setIsOpen(true)} 
          className="rounded-full h-14 w-14 shadow-2xl bg-primary hover:bg-primary/90"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-[350px] sm:w-[400px] h-[500px] flex flex-col shadow-2xl border-primary/20 animate-in slide-in-from-bottom-5">
          <CardHeader className="bg-primary text-white flex flex-row items-center justify-between p-4 rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              <div>
                <h3 className="font-bold">RIAM'S AI</h3>
                <p className="text-[10px] opacity-70">En ligne</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden bg-background">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'user' ? "ml-auto items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "p-3 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-primary text-white rounded-tr-none shadow-sm" 
                        : "bg-muted text-foreground rounded-tl-none border shadow-sm"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground italic text-xs">
                    <Bot className="h-4 w-4 animate-bounce" /> Assistant réfléchi...
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-3 border-t">
            <div className="flex w-full gap-2">
              <Input 
                placeholder="Posez votre question..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 rounded-full"
              />
              <Button size="icon" className="rounded-full bg-accent" onClick={handleSend} disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
