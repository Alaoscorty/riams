import { Navbar } from "@/components/layout/Navbar";
import { translations } from "@/lib/translations";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, Loader2, Eye, LayoutDashboard, Plus, Utensils,
  DollarSign, ListOrdered, Pencil, Trash2, Phone as PhoneIcon,
  CheckCircle, XCircle, Power, PowerOff, MoreVertical, Flame, Truck, Ban, MapPin,
  Briefcase
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { useFirebase, useCollection, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { language, isAuthenticated } = useStore();
  const { firestore } = useFirebase();
  const t = translations[language as keyof typeof translations] || translations.fr;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  // Form states
  const [imageSource, setImageSource] = useState<'url' | 'file'>('url');
  const [dishForm, setDishForm] = useState({ id: '', name: '', price: '', category: 'grillades', description: '', imageUrl: '' });
  const [galleryForm, setGalleryForm] = useState({ id: '', imageUrl: '', description: '' });
  const [galleryImageSource, setGalleryImageSource] = useState<'url' | 'file'>('url');
  const [employeeForm, setEmployeeForm] = useState({ id: '', name: '', contact: '', description: '', imageUrl: '' });
  const [employeeImageSource, setEmployeeImageSource] = useState<'url' | 'file'>('url');
  const [jobForm, setJobForm] = useState({ id: '', title: '', description: '', requirements: '', salary: '', isAvailable: true });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false);
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => { if (isMounted && !isAuthenticated) navigate("/login"); }, [isMounted, isAuthenticated, navigate]);

  const ordersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'orders'), orderBy('orderDate', 'desc')) : null, [firestore]);
  const dishesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'dishes'), orderBy('name', 'asc')) : null, [firestore]);
  const galleryQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'gallery'), orderBy('createdAt', 'desc')) : null, [firestore]);
  const employeesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'employees'), orderBy('createdAt', 'desc')) : null, [firestore]);
  const jobsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'jobs'), orderBy('createdAt', 'desc')) : null, [firestore]);

  const { data: orders, isLoading: isOrdersLoading } = useCollection(ordersQuery);
  const { data: dishes, isLoading: isDishesLoading } = useCollection(dishesQuery);
  const { data: gallery, isLoading: isGalleryLoading } = useCollection(galleryQuery);
  const { data: employees, isLoading: isEmployeesLoading } = useCollection(employeesQuery);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(jobsQuery);

  const stats = useMemo(() => {
    if (!orders) return { revenue: 0, pending: 0, total: 0 };
    const delivered = orders.filter(o => o.status === 'delivered');
    const revenue = delivered.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const pending = orders.filter(o => ['pending_payment', 'received', 'preparing', 'delivery'].includes(o.status)).length;
    return { revenue, pending, total: orders.length };
  }, [orders]);

  if (!isMounted || !isAuthenticated) return null;

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, 'orders', orderId), { status: newStatus });
    toast({ title: "Statut mis à jour", description: `Commande passée en : ${t.order_status[newStatus as keyof typeof t.order_status] || newStatus}` });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'dish' | 'gallery' | 'employee') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'dish') setDishForm(p => ({ ...p, imageUrl: result }));
        else if (type === 'gallery') setGalleryForm(p => ({ ...p, imageUrl: result }));
        else if (type === 'employee') setEmployeeForm(p => ({ ...p, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDish = async () => {
    if (!firestore || !dishForm.name) return;
    setIsSubmitting(true);
    try {
      const data = { ...dishForm, price: Number(dishForm.price), updatedAt: new Date().toISOString() };
      if (dishForm.id) updateDocumentNonBlocking(doc(firestore, 'dishes', dishForm.id), data);
      else await addDocumentNonBlocking(collection(firestore, 'dishes'), { ...data, isAvailable: true, createdAt: new Date().toISOString() });
      setIsEditDialogOpen(false);
      setDishForm({ id: '', name: '', price: '', category: 'grillades', description: '', imageUrl: '' });
    } finally { setIsSubmitting(false); }
  };

  const handleSaveGallery = async () => {
    if (!firestore || !galleryForm.imageUrl) return;
    setIsSubmitting(true);
    try {
      if (galleryForm.id) updateDocumentNonBlocking(doc(firestore, 'gallery', galleryForm.id), { ...galleryForm, updatedAt: new Date().toISOString() });
      else await addDocumentNonBlocking(collection(firestore, 'gallery'), { ...galleryForm, createdAt: new Date().toISOString() });
      setIsGalleryDialogOpen(false);
      setGalleryForm({ id: '', imageUrl: '', description: '' });
    } finally { setIsSubmitting(false); }
  };

  const handleSaveEmployee = async () => {
    if (!firestore || !employeeForm.name) return;
    setIsSubmitting(true);
    try {
      if (employeeForm.id) updateDocumentNonBlocking(doc(firestore, 'employees', employeeForm.id), { ...employeeForm, updatedAt: new Date().toISOString() });
      else await addDocumentNonBlocking(collection(firestore, 'employees'), { ...employeeForm, createdAt: new Date().toISOString() });
      setIsEmployeeDialogOpen(false);
      setEmployeeForm({ id: '', name: '', contact: '', description: '', imageUrl: '' });
    } finally { setIsSubmitting(false); }
  };

  const handleSaveJob = async () => {
    if (!firestore || !jobForm.title) return;
    setIsSubmitting(true);
    try {
      if (jobForm.id) updateDocumentNonBlocking(doc(firestore, 'jobs', jobForm.id), { ...jobForm, updatedAt: new Date().toISOString() });
      else await addDocumentNonBlocking(collection(firestore, 'jobs'), { ...jobForm, createdAt: new Date().toISOString() });
      setIsJobDialogOpen(false);
      setJobForm({ id: '', title: '', description: '', requirements: '', salary: '', isAvailable: true });
    } finally { setIsSubmitting(false); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'received': return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'preparing': return 'bg-orange-500/10 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      case 'delivery': return 'bg-purple-500/10 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
      case 'delivered': return 'bg-green-500/10 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'rejected': return 'bg-red-500/10 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <main className="min-h-screen pt-24 bg-muted/30">
      <Navbar />
      <div className="container mx-auto px-4 pb-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-4 py-1 font-bold">Administration</Badge>
            <h1 className="text-4xl md:text-5xl font-headline font-black flex items-center gap-3">
              <LayoutDashboard className="h-10 w-10 text-primary" /> Dashboard
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => { setDishForm({ id: '', name: '', price: '', category: 'grillades', description: '', imageUrl: '' }); setIsEditDialogOpen(true); }} className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-12 px-6">
              <Plus className="h-5 w-5 mr-2" /> Nouveau Plat
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-none shadow-xl bg-gradient-to-br from-primary to-primary/80 text-white rounded-[2rem] overflow-hidden relative group">
            <div className="absolute -right-6 -bottom-6 text-white/10 group-hover:text-white/20 transition-colors">
              <DollarSign className="h-32 w-32 rotate-12" />
            </div>
            <CardContent className="p-8 relative z-10">
              <div className="p-3 bg-white/20 w-fit rounded-2xl mb-4"><DollarSign className="h-6 w-6" /></div>
              <p className="text-sm opacity-80 font-bold uppercase tracking-wider">Revenus Livrés</p>
              <h3 className="text-3xl font-black mt-1">{stats.revenue.toLocaleString()} FCFA</h3>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-xl bg-card rounded-[2rem] overflow-hidden relative group border">
            <div className="absolute -right-6 -bottom-6 text-blue-500/5 group-hover:text-blue-500/10 transition-colors dark:text-blue-400/5">
              <ListOrdered className="h-32 w-32 rotate-12" />
            </div>
            <CardContent className="p-8 relative z-10">
              <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl mb-4 dark:bg-blue-900/30"><ListOrdered className="h-6 w-6" /></div>
              <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Commandes actives</p>
              <h3 className="text-3xl font-black mt-1">{stats.pending}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-card rounded-[2rem] overflow-hidden relative group border">
            <div className="absolute -right-6 -bottom-6 text-accent/5 group-hover:text-accent/10 transition-colors dark:text-accent/5">
              <Utensils className="h-32 w-32 rotate-12" />
            </div>
            <CardContent className="p-8 relative z-10">
              <div className="p-3 bg-accent/10 text-accent rounded-2xl mb-4 dark:bg-accent/20"><Utensils className="h-6 w-6" /></div>
              <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Articles Menu</p>
              <h3 className="text-3xl font-black mt-1">{dishes?.length || 0}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-card rounded-[2rem] overflow-hidden relative group border">
            <div className="absolute -right-6 -bottom-6 text-secondary/5 group-hover:text-secondary/10 transition-colors dark:text-secondary/5">
              <Briefcase className="h-32 w-32 rotate-12" />
            </div>
            <CardContent className="p-8 relative z-10">
              <div className="p-3 bg-secondary/10 text-secondary rounded-2xl mb-4 dark:bg-secondary/20"><Briefcase className="h-6 w-6" /></div>
              <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Offres Jobs</p>
              <h3 className="text-3xl font-black mt-1">{jobs?.filter(j => j.isAvailable).length || 0}</h3>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-card p-1 h-16 rounded-2xl border shadow-sm w-full no-scrollbar overflow-x-auto overflow-y-hidden">
            <TabsTrigger value="orders" className="flex-1 rounded-xl h-full font-black text-lg data-[state=active]:bg-primary data-[state=active]:text-white">Commandes</TabsTrigger>
            <TabsTrigger value="menu" className="flex-1 rounded-xl h-full font-black text-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Menu</TabsTrigger>
            <TabsTrigger value="gallery" className="flex-1 rounded-xl h-full font-black text-lg data-[state=active]:bg-orange-600 data-[state=active]:text-white">Galerie</TabsTrigger>
            <TabsTrigger value="employees" className="flex-1 rounded-xl h-full font-black text-lg data-[state=active]:bg-secondary data-[state=active]:text-white">Employés</TabsTrigger>
            <TabsTrigger value="jobs" className="flex-1 rounded-xl h-full font-black text-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="border-none shadow-xl overflow-hidden rounded-[2rem] bg-card">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50 h-16">
                    <TableRow className="border-none">
                      <TableHead className="font-bold px-8">Client</TableHead>
                      <TableHead className="font-bold">Montant</TableHead>
                      <TableHead className="font-bold">Statut</TableHead>
                      <TableHead className="text-right font-bold px-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isOrdersLoading ? <TableRow><TableCell colSpan={4} className="text-center h-40"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></TableCell></TableRow> : 
                      orders?.map(order => (
                        <TableRow key={order.id} className="h-20 border-b last:border-none hover:bg-muted/30">
                          <TableCell className="px-8">
                            <div className="flex flex-col">
                              <span className="font-black text-primary">{order.customerName}</span>
                              <span className="text-xs text-muted-foreground">{new Date(order.orderDate).toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-black">{order.totalAmount?.toLocaleString()} FCFA</TableCell>
                          <TableCell><Badge variant="outline" className={cn("rounded-full font-bold", getStatusColor(order.status))}>{t.order_status[order.status as keyof typeof t.order_status] || order.status}</Badge></TableCell>
                          <TableCell className="text-right px-8">
                            <div className="flex items-center justify-end gap-2">
                              <Dialog>
                                <DialogTrigger asChild><Button variant="ghost" size="icon" className="rounded-full"><Eye className="h-5 w-5" /></Button></DialogTrigger>
                                <DialogContent className="rounded-[2rem] max-w-lg">
                                  <DialogHeader><DialogTitle className="font-black">Détails de la Commande {order.id?.slice(0, 8).toUpperCase()}</DialogTitle></DialogHeader>
                                  <div className="space-y-6 pt-4">
                                    <div className="grid grid-cols-1 gap-4">
                                      <div className="p-4 bg-muted/30 rounded-2xl border flex items-start gap-4">
                                        <div className="bg-primary/10 p-2 rounded-xl text-primary"><MapPin className="h-5 w-5" /></div>
                                        <div>
                                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Adresse de livraison</p>
                                          <p className="font-bold">{order.deliveryAddress}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="p-4 bg-muted/30 rounded-2xl border flex items-start gap-4">
                                        <div className="bg-primary/10 p-2 rounded-xl text-primary"><PhoneIcon className="h-5 w-5" /></div>
                                        <div>
                                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Contact Client (Pour Livreur)</p>
                                          <p className="font-black text-lg">{order.phone}</p>
                                          <Button variant="link" className="p-0 h-auto text-primary font-bold" asChild>
                                            <a href={`tel:${order.phone}`}>Appeler le client</a>
                                          </Button>
                                        </div>
                                      </div>
                                    </div>

                                    {order.paymentScreenshot && (
                                      <div className="space-y-2">
                                        <Label className="font-bold text-xs uppercase text-primary">Preuve de paiement</Label>
                                        <div className="aspect-video w-full rounded-2xl overflow-hidden border-2 border-primary/20 shadow-lg bg-muted flex items-center justify-center">
                                          <img src={order.paymentScreenshot} className="object-cover w-full h-full" alt="Paiement" />
                                        </div>
                                      </div>
                                    )}

                                    <div className="flex flex-wrap gap-2 pt-2 border-t mt-4">
                                      <Button onClick={() => handleUpdateStatus(order.id, 'received')} size="sm" className="bg-blue-600 rounded-full font-bold">Confirmer Paiement</Button>
                                      <Button onClick={() => handleUpdateStatus(order.id, 'rejected')} size="sm" variant="destructive" className="rounded-full font-bold">Rejeter</Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="h-5 w-5" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl p-2 w-52">
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'received')} className="font-bold flex items-center gap-2 text-blue-600"><CheckCircle className="h-4 w-4" /> {t.order_actions.confirm}</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'preparing')} className="font-bold flex items-center gap-2 text-orange-600"><Flame className="h-4 w-4" /> {t.order_actions.prepare}</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'delivery')} className="font-bold flex items-center gap-2 text-purple-600"><Truck className="h-4 w-4" /> {t.order_actions.ship}</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'delivered')} className="font-bold flex items-center gap-2 text-green-600"><CheckCircle className="h-4 w-4" /> {t.order_actions.complete}</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'rejected')} className="font-bold flex items-center gap-2 text-red-600"><Ban className="h-4 w-4" /> {t.order_actions.reject}</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="menu">
            <Card className="border-none shadow-xl overflow-hidden rounded-[2rem] bg-card">
              <Table>
                <TableHeader className="bg-muted/50 h-16">
                  <TableRow className="border-none"><TableHead className="font-bold px-8">Plat</TableHead><TableHead className="font-bold">Prix</TableHead><TableHead className="font-bold">Statut</TableHead><TableHead className="text-right font-bold px-8">Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {isDishesLoading ? <TableRow><TableCell colSpan={4} className="text-center h-40"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></TableCell></TableRow> : dishes?.map(dish => (
                    <TableRow key={dish.id} className="h-20 border-b last:border-none hover:bg-muted/30">
                      <TableCell className="px-8"><div className="flex items-center gap-4"><img src={dish.imageUrl} className="h-12 w-12 rounded-xl object-cover border" /><span className="font-black">{dish.name}</span></div></TableCell>
                      <TableCell className="font-bold">{dish.price.toLocaleString()} FCFA</TableCell>
                      <TableCell><Badge variant={dish.isAvailable ? "default" : "secondary"} className={cn("rounded-full font-bold", dish.isAvailable ? "bg-green-600" : "bg-red-500 text-white")}>{dish.isAvailable ? "Disponible" : "Épuisé"}</Badge></TableCell>
                      <TableCell className="text-right px-8">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => updateDocumentNonBlocking(doc(firestore!, 'dishes', dish.id), { isAvailable: !dish.isAvailable })} className={cn("rounded-full", dish.isAvailable ? "text-green-600" : "text-red-500")}>
                            {dish.isAvailable ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setDishForm(dish); setIsEditDialogOpen(true); }} className="rounded-full"><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteDocumentNonBlocking(doc(firestore!, 'dishes', dish.id))}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="gallery">
            <Card className="border-none shadow-xl overflow-hidden rounded-[2rem] bg-card">
              <div className="p-8 border-b flex justify-between items-center"><h3 className="text-xl font-black">Galerie</h3><Button onClick={() => { setGalleryForm({ id: '', imageUrl: '', description: '' }); setIsGalleryDialogOpen(true); }} className="bg-orange-600 hover:bg-orange-700 text-white rounded-full"><Plus className="h-4 w-4 mr-2" /> Ajouter une image</Button></div>
              <Table>
                <TableBody>
                  {isGalleryLoading ? <TableRow><TableCell className="text-center h-40"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></TableCell></TableRow> : gallery?.map(img => (
                    <TableRow key={img.id} className="h-28 border-b">
                      <TableCell className="px-8"><div className="h-20 w-32 rounded-xl overflow-hidden border"><img src={img.imageUrl} className="object-cover w-full h-full" /></div></TableCell>
                      <TableCell className="italic text-muted-foreground">{img.description}</TableCell>
                      <TableCell className="text-right px-8"><Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteDocumentNonBlocking(doc(firestore!, 'gallery', img.id))}><Trash2 className="h-5 w-5" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="employees">
            <Card className="border-none shadow-xl overflow-hidden rounded-[2rem] bg-card">
              <div className="p-8 border-b flex justify-between items-center"><h3 className="text-xl font-black">Équipe</h3><Button onClick={() => { setEmployeeForm({ id: '', name: '', contact: '', description: '', imageUrl: '' }); setIsEmployeeDialogOpen(true); }} className="bg-secondary hover:bg-secondary/90 text-white rounded-full"><Plus className="h-4 w-4 mr-2" /> Ajouter un employé</Button></div>
              <Table>
                <TableHeader className="bg-muted/50 h-16"><TableRow className="border-none"><TableHead className="font-bold px-8">Employé</TableHead><TableHead className="font-bold">Contact</TableHead><TableHead className="text-right font-bold px-8">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {isEmployeesLoading ? <TableRow><TableCell colSpan={3} className="text-center h-40"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></TableCell></TableRow> : employees?.map(emp => (
                    <TableRow key={emp.id} className="h-20 border-b">
                      <TableCell className="px-8"><div className="flex items-center gap-4"><img src={emp.imageUrl} className="h-10 w-10 rounded-full object-cover border" /><span className="font-black">{emp.name}</span></div></TableCell>
                      <TableCell className="font-bold text-muted-foreground">{emp.contact}</TableCell>
                      <TableCell className="text-right px-8"><Button variant="ghost" size="icon" onClick={() => { setEmployeeForm(emp); setIsEmployeeDialogOpen(true); }} className="rounded-full"><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteDocumentNonBlocking(doc(firestore!, 'employees', emp.id))}><Trash2 className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <Card className="border-none shadow-xl overflow-hidden rounded-[2rem] bg-card">
              <div className="p-8 border-b flex justify-between items-center"><h3 className="text-xl font-black">Offres d'emploi</h3><Button onClick={() => { setJobForm({ id: '', title: '', description: '', requirements: '', salary: '', isAvailable: true }); setIsJobDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full"><Plus className="h-4 w-4 mr-2" /> Publier une offre</Button></div>
              <Table>
                <TableHeader className="bg-muted/50 h-16"><TableRow className="border-none"><TableHead className="font-bold px-8">Offre</TableHead><TableHead className="font-bold">Statut</TableHead><TableHead className="text-right font-bold px-8">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {isJobsLoading ? <TableRow><TableCell colSpan={3} className="text-center h-40"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></TableCell></TableRow> : jobs?.map(job => (
                    <TableRow key={job.id} className="h-20 border-b">
                      <TableCell className="px-8"><span className="font-black text-blue-600">{job.title}</span></TableCell>
                      <TableCell><Badge variant={job.isAvailable ? "default" : "secondary"}>{job.isAvailable ? "Ouverte" : "Suspendue"}</Badge></TableCell>
                      <TableCell className="text-right px-8">
                        <Button variant="ghost" size="icon" onClick={() => updateDocumentNonBlocking(doc(firestore!, 'jobs', job.id), { isAvailable: !job.isAvailable })} className={job.isAvailable ? "text-blue-600" : "text-gray-400"}>
                          {job.isAvailable ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setJobForm(job); setIsJobDialogOpen(true); }} className="rounded-full"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteDocumentNonBlocking(doc(firestore!, 'jobs', job.id))}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          
        </Tabs>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader><DialogTitle className="font-black">{dishForm.id ? 'Modifier le plat' : 'Nouveau plat'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1"><Label>Nom du plat</Label><Input value={dishForm.name} onChange={e => setDishForm({...dishForm, name: e.target.value})} /></div>
            <div className="space-y-1"><Label>Prix (FCFA)</Label><Input type="number" value={dishForm.price} onChange={e => setDishForm({...dishForm, price: e.target.value})} /></div>
            <div className="space-y-1"><Label>Catégorie</Label>
              <Select value={dishForm.category} onValueChange={v => setDishForm({...dishForm, category: v})}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(t.categories).map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-1"><Label>Description</Label><Textarea value={dishForm.description} onChange={e => setDishForm({...dishForm, description: e.target.value})} /></div>
            <div className="space-y-2">
              <Label>Image (URL ou fichier)</Label>
              <RadioGroup value={imageSource} onValueChange={(v:any) => setImageSource(v)} className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="url" id="u1" /><Label htmlFor="u1">URL</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="file" id="f1" /><Label htmlFor="f1">Fichier</Label></div></RadioGroup>
              {imageSource === 'url' ? <Input value={dishForm.imageUrl} onChange={e => setDishForm({...dishForm, imageUrl: e.target.value})} /> : <Input type="file" onChange={e => handleFileChange(e, 'dish')} />}
            </div>
          </div>
          <Button onClick={handleSaveDish} className="w-full h-14 rounded-full bg-accent text-accent-foreground font-black" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : "Enregistrer"}</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isGalleryDialogOpen} onOpenChange={setIsGalleryDialogOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader><DialogTitle className="font-black">Ajouter à la Galerie</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <RadioGroup value={galleryImageSource} onValueChange={(v:any) => setGalleryImageSource(v)} className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="url" id="g1" /><Label htmlFor="g1">URL</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="file" id="g2" /><Label htmlFor="g2">Fichier</Label></div></RadioGroup>
            {galleryImageSource === 'url' ? <Input value={galleryForm.imageUrl} onChange={e => setGalleryForm({...galleryForm, imageUrl: e.target.value})} /> : <Input type="file" onChange={e => handleFileChange(e, 'gallery')} />}
            <Textarea value={galleryForm.description} onChange={e => setGalleryForm({...galleryForm, description: e.target.value})} placeholder="Description" />
          </div>
          <Button onClick={handleSaveGallery} className="w-full h-14 rounded-full bg-orange-600 text-white font-black" disabled={isSubmitting}>Publier</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader><DialogTitle className="font-black">Gérer l'employé</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input value={employeeForm.name} onChange={e => setEmployeeForm({...employeeForm, name: e.target.value})} placeholder="Nom" />
            <Input value={employeeForm.contact} onChange={e => setEmployeeForm({...employeeForm, contact: e.target.value})} placeholder="Contact" />
            <Textarea value={employeeForm.description} onChange={e => setEmployeeForm({...employeeForm, description: e.target.value})} placeholder="Rôle" />
            <RadioGroup value={employeeImageSource} onValueChange={(v:any) => setEmployeeImageSource(v)} className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="url" id="e1" /><Label htmlFor="e1">URL</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="file" id="e2" /><Label htmlFor="e2">Fichier</Label></div></RadioGroup>
            {employeeImageSource === 'url' ? <Input value={employeeForm.imageUrl} onChange={e => setEmployeeForm({...employeeForm, imageUrl: e.target.value})} /> : <Input type="file" onChange={e => handleFileChange(e, 'employee')} />}
          </div>
          <Button onClick={handleSaveEmployee} className="w-full h-14 rounded-full bg-secondary text-white font-black" disabled={isSubmitting}>Enregistrer</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader><DialogTitle className="font-black">Gérer l'offre d'emploi</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} placeholder="Titre" />
            <Input value={jobForm.salary} onChange={e => setJobForm({...jobForm, salary: e.target.value})} placeholder="Salaire" />
            <Textarea value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} placeholder="Description" />
            <Textarea value={jobForm.requirements} onChange={e => setJobForm({...jobForm, requirements: e.target.value})} placeholder="Prérequis" />
          </div>
          <Button onClick={handleSaveJob} className="w-full h-14 rounded-full bg-blue-600 text-white font-black" disabled={isSubmitting}>Publier l'offre</Button>
        </DialogContent>
      </Dialog>
    </main>
  );
}
