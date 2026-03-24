import { Navbar } from "@/components/layout/Navbar";
import { translations } from "@/lib/translations";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, Package, Truck, Clock, Receipt, Download, 
  MessageSquare, Loader2, Flame, AlertCircle, History, ArrowRight,
  Search, Copy, Check, MapPin, Calendar, DollarSign, Lock, HandHeart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useFirebase, useDoc, useCollection, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

function TrackContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('id') || '';
  const { firestore, isUserLoading } = useFirebase();
  const { language, customerSession } = useStore();
  const { toast } = useToast();
  const t = translations[language as keyof typeof translations] || translations.fr;
  
  const [searchId, setSearchId] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const userOrdersQuery = useMemoFirebase(() => {
    if (!firestore || !customerSession?.phone) return null;
    return query(collection(firestore, 'orders'), where('phone', '==', customerSession.phone));
  }, [firestore, customerSession?.phone]);

  const { data: rawOrders, isLoading: isHistoryLoading } = useCollection(userOrdersQuery);

  const userOrders = useMemo(() => {
    if (!rawOrders) return null;
    return [...rawOrders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }, [rawOrders]);

  const orderRef = useMemoFirebase(() => {
    if (!firestore || !orderId) return null;
    return doc(firestore, 'orders', orderId);
  }, [firestore, orderId]);

  const { data: order, isLoading } = useDoc(orderRef);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      setSearchParams({ id: searchId.trim() });
      setShowHistory(false);
    }
  };

  const copyToClipboard = (id: string) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast({ title: t.copy_success, description: t.copy_desc });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirmReceipt = () => {
    if (!firestore || !order) return;
    setIsConfirming(true);
    updateDocumentNonBlocking(doc(firestore, 'orders', order.id), { status: 'delivered' });
    toast({
      title: t.receipt_confirmed,
      description: "Merci d'avoir choisi RIAM'S 7.16 LOUNGE !",
    });
    setTimeout(() => setIsConfirming(false), 1000);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (isUserLoading) return <div className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /></div>;

  if (showHistory) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-headline font-bold">{t.my_orders}</h1>
          <Button variant="ghost" className="rounded-full" onClick={() => setShowHistory(false)}>Retour</Button>
        </div>
        {isHistoryLoading ? <div className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /></div> : (
          <div className="space-y-4">
            {userOrders && userOrders.length > 0 ? userOrders.map(o => (
              <Card key={o.id} className="border-none shadow-md hover:shadow-lg transition-all group overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full text-primary">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm"># {o.id?.slice(0, 8).toUpperCase()}</p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.preventDefault();
                            copyToClipboard(o.id);
                          }}
                        >
                          {copiedId === o.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{new Date(o.orderDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold hidden sm:flex">
                      {t.order_status[o.status as keyof typeof t.order_status] || o.status}
                    </Badge>
                    <Button variant="ghost" size="icon" className="rounded-full bg-muted/50" asChild>
                      <Link to={`/track?id=${o.id}`} onClick={() => setShowHistory(false)}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) : <p className="text-center opacity-50 py-10">{t.no_orders}</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex flex-col sm:flex-row gap-4 mb-12 items-center justify-center">
        <form onSubmit={handleSearch} className="flex w-full max-w-md gap-2">
          <Input 
            placeholder={t.order_id_placeholder} 
            value={searchId} 
            onChange={(e) => setSearchId(e.target.value)} 
            className="rounded-full h-12 bg-card" 
          />
          <Button type="submit" className="rounded-full h-12 px-8 bg-primary font-bold">{t.track_btn}</Button>
        </form>
        <Button variant="outline" className="rounded-full h-12 gap-2 bg-card shadow-sm" onClick={() => setShowHistory(true)}>
          <History className="h-5 w-5" /> {t.my_orders}
        </Button>
      </div>

      {orderId ? (
        isLoading ? <div className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /></div> : !order ? (
          <div className="text-center py-20 bg-card rounded-[3rem] shadow-xl border-2 border-dashed border-destructive/20">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Commande introuvable</h2>
            <p className="text-muted-foreground mt-2">Vérifiez l'identifiant saisi ou consultez votre historique.</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-headline font-black uppercase tracking-tight">{t.track_your_order}</h1>
              <div className="flex items-center justify-center gap-2 group">
                <p className="text-primary font-black text-xl"># {order.id?.slice(0, 8).toUpperCase()}</p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={() => copyToClipboard(order.id)}
                >
                  {copiedId === order.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {order.status === 'rejected' && (
              <Alert variant="destructive" className="bg-destructive/10 rounded-3xl border-destructive/20 animate-pulse">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="font-black">Paiement Rejeté</AlertTitle>
                <AlertDescription className="font-bold">{t.rejected_message}</AlertDescription>
              </Alert>
            )}

            {order.status === 'delivery' && (
              <Card className="bg-primary/5 border-primary/20 border-2 rounded-[2rem] overflow-hidden animate-bounce">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary p-3 rounded-full text-white">
                      <HandHeart className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-black text-lg">Votre commande est arrivée !</p>
                      <p className="text-sm text-muted-foreground">Confirmez-vous la réception ?</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleConfirmReceipt} 
                    disabled={isConfirming}
                    className="rounded-full bg-primary hover:bg-primary/90 text-white font-black px-8 h-12 shadow-xl shadow-primary/20"
                  >
                    {isConfirming ? <Loader2 className="h-5 w-5 animate-spin" /> : t.confirm_receipt}
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="border-none shadow-2xl bg-card rounded-[3rem] overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="relative mb-24 mt-6">
                  {(() => {
                    const steps = [
                      { id: 'pending_payment', label: t.order_status.pending_payment, icon: Clock },
                      { id: 'received', label: t.order_status.received, icon: Package },
                      { id: 'preparing', label: t.order_status.preparing, icon: Flame },
                      { id: 'delivery', label: t.order_status.delivery, icon: Truck },
                      { id: 'delivered', label: t.order_status.delivered, icon: CheckCircle2 },
                    ];
                    const idx = steps.findIndex(s => s.id === order.status);
                    const safeIdx = idx === -1 ? 0 : idx;
                    const progress = order.status === 'rejected' ? 0 : ((safeIdx + 1) / steps.length) * 100;
                    
                    return (
                      <>
                        <Progress value={progress} className="h-4 bg-muted" />
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between">
                          {steps.map((s, i) => {
                            const Icon = s.icon;
                            const active = i <= safeIdx && order.status !== 'rejected';
                            const current = i === safeIdx && order.status !== 'rejected';
                            
                            return (
                              <div key={s.id} className="flex flex-col items-center gap-2 relative">
                                <div className={cn(
                                  "h-12 w-12 rounded-full flex items-center justify-center relative z-10 transition-all duration-500",
                                  active ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30" : "bg-muted text-muted-foreground",
                                  current && "animate-pulse ring-4 ring-primary/20"
                                )}>
                                  <Icon className="h-6 w-6" />
                                </div>
                                <span className={cn(
                                  "text-[10px] font-black absolute -bottom-12 whitespace-nowrap uppercase tracking-tighter transition-colors",
                                  active ? "text-primary" : "text-muted-foreground"
                                )}>
                                  {s.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-8 border-t">
                  <div className="space-y-4">
                    <h3 className="font-headline font-bold text-xl flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-primary" /> Détails Commande
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Adresse</p>
                          <p className="text-muted-foreground">{order.deliveryAddress}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-bold">Date</p>
                          <p className="text-muted-foreground">{new Date(order.orderDate).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-bold">Total</p>
                          <p className="text-primary font-black text-lg">{order.totalAmount?.toLocaleString()} FCFA</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-headline font-bold text-xl flex items-center gap-2">
                      <Download className="h-5 w-5 text-accent" /> {t.receipt} & Support
                    </h3>
                    <div className="flex flex-col gap-3">
                      {(() => {
                        const canDownload = !['pending_payment', 'rejected'].includes(order.status);
                        return (
                          <div className="space-y-2">
                            <Button 
                              onClick={handleDownloadPDF}
                              className={cn(
                                "w-full h-12 rounded-full font-black gap-2 shadow-lg transition-all",
                                canDownload 
                                  ? "bg-accent hover:bg-accent/90 text-accent-foreground" 
                                  : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                              )}
                              disabled={!canDownload}
                            >
                              {canDownload ? <Download className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                              {t.download_pdf}
                            </Button>
                            {!canDownload && order.status !== 'rejected' && (
                              <p className="text-[10px] text-center text-muted-foreground italic">
                                Disponible après confirmation du paiement.
                              </p>
                            )}
                          </div>
                        );
                      })()}
                      <Button variant="outline" asChild className="w-full h-12 rounded-full border-primary/20 hover:bg-primary/5 font-black gap-2">
                        <a href={`https://wa.me/22997000000?text=Bonjour, je souhaite des informations sur ma commande #${order.id?.slice(0, 8).toUpperCase()}`} target="_blank" rel="noopener noreferrer">
                          <MessageSquare className="h-5 w-5 text-green-600" /> {t.send_whatsapp}
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      ) : (
        <div className="text-center py-24 bg-card rounded-[4rem] shadow-xl border-2 border-dashed border-primary/10 max-w-2xl mx-auto animate-in fade-in zoom-in duration-500">
          <div className="bg-primary/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <Search className="h-12 w-12 text-primary opacity-40" />
          </div>
          <h2 className="text-3xl font-headline font-black mb-4 uppercase tracking-tight">{t.track_your_order}</h2>
          <p className="text-muted-foreground max-sm mx-auto leading-relaxed italic">
            {t.track_desc}
          </p>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <main className="min-h-screen pt-24 bg-muted/20">
      <Navbar />
      <TrackContent />
    </main>
  );
}
