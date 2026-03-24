import { Navbar } from "@/components/layout/Navbar";
import { useStore, getDeliveryFee } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Minus, ArrowLeft, Truck, Camera, CheckCircle, Loader2, Info } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFirebase, setDocumentNonBlocking } from "@/firebase";
import { doc, collection } from "firebase/firestore";

export default function CartPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { cart, language, updateQuantity, removeFromCart, deliveryZone, setDeliveryZone, clearCart, setCustomerSession } = useStore();
  const t = translations[language];
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = getDeliveryFee(deliveryZone);
  const total = subtotal + deliveryFee;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address || !screenshot) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: !screenshot ? "Veuillez envoyer la capture du paiement." : "Veuillez remplir tous les champs."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const customerId = `cust_${formData.phone.replace(/\D/g, '')}`;
      const customerRef = doc(firestore, 'customers', customerId);
      
      setDocumentNonBlocking(customerRef, {
        id: customerId,
        name: formData.name,
        phoneNumber: formData.phone,
        preferredLanguage: language,
        createdAt: new Date().toISOString()
      }, { merge: true });

      setCustomerSession({
        name: formData.name,
        phone: formData.phone,
        id: customerId
      });

      const orderRef = doc(collection(firestore, 'orders'));
      const orderData = {
        id: orderRef.id,
        customerId: customerId,
        customerName: formData.name,
        phone: formData.phone,
        orderDate: new Date().toISOString(),
        status: 'pending_payment',
        deliveryAddress: formData.address,
        deliveryZoneId: deliveryZone,
        deliveryFee: deliveryFee,
        totalAmount: total,
        paymentMethod: 'Mobile Money',
        paymentScreenshot: screenshot,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };

      setDocumentNonBlocking(orderRef, orderData, { merge: true });
      
      clearCart();
      navigate(`/track?id=${orderRef.id}`);
      toast({
        title: "Commande enregistrée",
        description: "Votre preuve de paiement a été envoyée pour vérification."
      });
      
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) return null;

  if (cart.length === 0) {
    return (
      <main className="min-h-screen pt-24 bg-background">
        <Navbar />
        <div className="container mx-auto px-4 text-center py-20">
          <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-headline font-bold mb-4">Votre panier est vide</h1>
          <Button asChild className="rounded-full bg-primary px-10">
            <Link to="/menu">{t.view_menu}</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12 bg-background">
      <Navbar />
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/menu"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-4xl font-headline font-bold">Mon Panier</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <Card key={item.id} className="overflow-hidden border-none shadow-md">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="relative h-24 w-24 rounded-lg overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-primary font-bold">{item.price.toLocaleString()} FCFA</p>
                  </div>
                  <div className="flex items-center gap-3 bg-muted rounded-full px-3 py-1">
                    <button title="ajouter" onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-primary"><Minus className="h-4 w-4" /></button>
                    <span className="font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-primary"><Plus className="h-4 w-4" /></button>
                  </div>
                  <Button title="retirer" variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="border-none shadow-xl bg-card sticky top-28">
              <CardContent className="p-6 space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" /> Livraison & Paiement
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.full_name}</Label>
                    <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Votre nom" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t.phone}</Label>
                    <Input id="phone" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+229..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">{t.address}</Label>
                    <Input id="address" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Quartier, Rue..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zone">Zone</Label>
                    <Select value={deliveryZone} onValueChange={setDeliveryZone}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dowa">Dowa (500 FCFA)</SelectItem>
                        <SelectItem value="Djassin">Djassin (1000 FCFA)</SelectItem>
                        <SelectItem value="Ouando">Ouando (1000 FCFA)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-muted p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-primary">
                      <Info className="h-4 w-4" /> {t.payment_method}
                    </div>
                    <p className="text-xs text-muted-foreground">{t.payment_instruction}</p>
                    <div className="relative group">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="hidden" 
                        id="screenshot-upload"
                      />
                      <Label 
                        htmlFor="screenshot-upload" 
                        className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer hover:bg-muted/80 transition-all border-primary/20"
                      >
                        {screenshot ? (
                          <div className="text-center">
                            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <span className="text-xs font-bold">Capture sélectionnée</span>
                          </div>
                        ) : (
                          <>
                            <Camera className="h-8 w-8 text-primary/40 mb-2" />
                            <span className="text-xs font-bold">{t.upload_proof}</span>
                          </>
                        )}
                      </Label>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span>Sous-total</span><span>{subtotal.toLocaleString()} FCFA</span></div>
                    <div className="flex justify-between"><span>Livraison</span><span>{deliveryFee.toLocaleString()} FCFA</span></div>
                    <div className="flex justify-between text-xl font-bold pt-2"><span>{t.total}</span><span className="text-primary">{total.toLocaleString()} FCFA</span></div>
                  </div>

                  <Button type="submit" className="w-full h-14 bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-full" disabled={isSubmitting || !screenshot}>
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t.confirm_order}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
