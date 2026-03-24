"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { BadgeCheck, HeartPulse, ShieldCheck, ShoppingBag, Stethoscope, Truck, Search, Upload, FileText, CheckCircle2, Loader2, Plus, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { toast } from "@/components/ui/sonner";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  "Daily Medicines",
  "Injectables",
  "Vitals & Devices",
  "Supplements",
  "Personal Care",
  "First Aid",
  "Pediatrics",
  "Antibiotics"
];

const products = [
  { id: "insulin-10ml", name: "Insulin (10ml)", subtitle: "Novo Nordisk", price: 180, tag: "Rx", highlight: "In Stock (20)", accent: "from-primary/15 to-secondary/15", image: "/images/products/insulin.png" },
  { id: "metronidazole", name: "Metronidazole", subtitle: "Flagyl", price: 35, tag: "Rx", highlight: "In Stock (60)", accent: "from-secondary/15 to-primary/15", image: "/images/products/metformin.png" },
  { id: "ciprofloxacin-500", name: "Ciprofloxacin 500mg", subtitle: "Cipla", price: 60, tag: "Rx", highlight: "In Stock (40)", accent: "from-accent/15 to-primary/15", image: "/images/products/syringes.png" },
  { id: "augmentin-625", name: "Augmentin 625", subtitle: "GSK", price: 110, tag: "Rx", highlight: "In Stock (30)", accent: "from-primary/10 to-accent/20", image: "/images/products/vitamin_d3.png" },
  { id: "paracetamol-650", name: "Paracetamol 650mg", subtitle: "GSK", price: 30, tag: "OTC", highlight: "In Stock (100)", accent: "from-secondary/10 to-accent/20", image: "/images/products/metformin.png" },
  { id: "amoxicillin-500", name: "Amoxicillin 500mg", subtitle: "Generic", price: 55, tag: "Rx", highlight: "In Stock (50)", accent: "from-primary/10 to-secondary/20", image: "/images/products/syringes.png" },
  { id: "moov-spray", name: "Moov Spray", subtitle: "Reckitt", price: 150, tag: "OTC", highlight: "In Stock (45)", accent: "from-accent/10 to-secondary/20", image: "/images/products/pain_patch.png" },
  { id: "losartan", name: "Losartan", subtitle: "Generic", price: 75, tag: "Rx", highlight: "In Stock (45)", accent: "from-primary/15 to-accent/15", image: "/images/products/metformin.png" },
  { id: "betadine", name: "Betadine", subtitle: "Win-Medicare", price: 70, tag: "OTC", highlight: "In Stock (50)", accent: "from-primary/15 to-secondary/15", image: "/images/products/pain_patch.png" },
  { id: "calcium-tabs", name: "Calcium Tablets", subtitle: "Shelcal", price: 80, tag: "OTC", highlight: "In Stock (70)", accent: "from-secondary/15 to-primary/15", image: "/images/products/vitamin_d3.png" },
  { id: "vitamin-c", name: "Vitamin C", subtitle: "Limcee", price: 30, tag: "OTC", highlight: "In Stock (90)", accent: "from-accent/15 to-primary/15", image: "/images/products/vitamin_d3.png" },
  { id: "omeprazole", name: "Omeprazole", subtitle: "Generic", price: 30, tag: "Rx", highlight: "In Stock (90)", accent: "from-primary/10 to-accent/20", image: "/images/products/metformin.png" },
  { id: "ors-electral", name: "ORS", subtitle: "Electral", price: 22, tag: "OTC", highlight: "In Stock (120)", accent: "from-secondary/10 to-accent/20", image: "/images/products/electrolytes.png" },
  { id: "ranitidine", name: "Ranitidine", subtitle: "Generic", price: 20, tag: "OTC", highlight: "In Stock (100)", accent: "from-primary/10 to-secondary/20", image: "/images/products/metformin.png" },
  { id: "volini-spray", name: "Volini Spray", subtitle: "Ranbaxy", price: 160, tag: "OTC", highlight: "In Stock (40)", accent: "from-accent/10 to-secondary/20", image: "/images/products/pain_patch.png" },
  { id: "crocin", name: "Crocin", subtitle: "GSK", price: 28, tag: "OTC", highlight: "In Stock (90)", accent: "from-primary/15 to-accent/15", image: "/images/products/metformin.png" },
  { id: "doxycycline", name: "Doxycycline", subtitle: "Generic", price: 45, tag: "Rx", highlight: "In Stock (35)", accent: "from-primary/15 to-secondary/15", image: "/images/products/syringes.png" },
  { id: "atorvastatin", name: "Atorvastatin", subtitle: "Lipitor", price: 60, tag: "Rx", highlight: "In Stock (55)", accent: "from-secondary/15 to-primary/15", image: "/images/products/metformin.png" },
  { id: "amlodipine", name: "Amlodipine", subtitle: "Generic", price: 30, tag: "Rx", highlight: "In Stock (70)", accent: "from-accent/15 to-primary/15", image: "/images/products/metformin.png" },
  { id: "atenolol", name: "Atenolol", subtitle: "Generic", price: 40, tag: "Rx", highlight: "In Stock (60)", accent: "from-primary/10 to-accent/20", image: "/images/products/metformin.png" },
  { id: "zinc-tabs", name: "Zinc Tablets", subtitle: "Generic", price: 25, tag: "OTC", highlight: "In Stock (100)", accent: "from-secondary/10 to-accent/20", image: "/images/products/vitamin_d3.png" },
  { id: "montelukast", name: "Montelukast", subtitle: "Generic", price: 75, tag: "Rx", highlight: "In Stock (50)", accent: "from-primary/10 to-secondary/20", image: "/images/products/metformin.png" },
  { id: "vicks-vaporub", name: "Vicks Vaporub", subtitle: "P&G", price: 95, tag: "OTC", highlight: "In Stock (80)", accent: "from-accent/10 to-secondary/20", image: "/images/products/pain_patch.png" },
  { id: "allegra", name: "Allegra", subtitle: "Sanofi", price: 150, tag: "OTC", highlight: "In Stock (40)", accent: "from-primary/15 to-accent/15", image: "/images/products/metformin.png" },
  { id: "digene", name: "Digene", subtitle: "Abbott", price: 90, tag: "OTC", highlight: "In Stock (60)", accent: "from-primary/15 to-secondary/15", image: "/images/products/electrolytes.png" },
  { id: "benadryl", name: "Benadryl", subtitle: "J&J", price: 120, tag: "OTC", highlight: "In Stock (45)", accent: "from-secondary/15 to-primary/15", image: "/images/products/pain_patch.png" },
  { id: "cetirizine", name: "Cetirizine", subtitle: "Generic", price: 18, tag: "OTC", highlight: "In Stock (100)", accent: "from-accent/15 to-primary/15", image: "/images/products/metformin.png" },
  { id: "combiflam", name: "Combiflam", subtitle: "Sanofi", price: 40, tag: "OTC", highlight: "In Stock (75)", accent: "from-primary/10 to-accent/20", image: "/images/products/metformin.png" },
  { id: "disprin", name: "Disprin", subtitle: "Reckitt", price: 18, tag: "OTC", highlight: "In Stock (80)", accent: "from-secondary/10 to-accent/20", image: "/images/products/metformin.png" },
  { id: "telmisartan", name: "Telmisartan", subtitle: "Generic", price: 85, tag: "Rx", highlight: "In Stock (50)", accent: "from-primary/10 to-secondary/20", image: "/images/products/metformin.png" },
  { id: "gelusil", name: "Gelusil", subtitle: "Pfizer", price: 85, tag: "OTC", highlight: "In Stock (55)", accent: "from-accent/10 to-secondary/20", image: "/images/products/electrolytes.png" },
  { id: "corex", name: "Corex", subtitle: "Pfizer", price: 140, tag: "Rx", highlight: "In Stock (35)", accent: "from-primary/15 to-accent/15", image: "/images/products/pain_patch.png" },
  { id: "clarithromycin", name: "Clarithromycin", subtitle: "Generic", price: 140, tag: "Rx", highlight: "In Stock (20)", accent: "from-primary/15 to-secondary/15", image: "/images/products/syringes.png" },
  { id: "brufen-400", name: "Brufen 400", subtitle: "Abbott", price: 25, tag: "OTC", highlight: "In Stock (60)", accent: "from-secondary/15 to-primary/15", image: "/images/products/metformin.png" },
  { id: "pantoprazole", name: "Pantoprazole", subtitle: "Generic", price: 40, tag: "Rx", highlight: "In Stock (80)", accent: "from-accent/15 to-primary/15", image: "/images/products/metformin.png" },
  { id: "aspirin", name: "Aspirin", subtitle: "Bayer", price: 15, tag: "OTC", highlight: "In Stock (120)", accent: "from-primary/10 to-accent/20", image: "/images/products/metformin.png" },
  { id: "paracetamol-500", name: "Paracetamol 500mg", subtitle: "GSK", price: 20, tag: "OTC", highlight: "In Stock (100)", accent: "from-secondary/10 to-accent/20", image: "/images/products/metformin.png" },
  { id: "cefixime-200", name: "Cefixime 200mg", subtitle: "Generic", price: 95, tag: "Rx", highlight: "In Stock (25)", accent: "from-primary/10 to-secondary/20", image: "/images/products/syringes.png" },
  { id: "levocetirizine", name: "Levocetirizine", subtitle: "Generic", price: 25, tag: "OTC", highlight: "In Stock (80)", accent: "from-accent/10 to-secondary/20", image: "/images/products/metformin.png" },
  { id: "supradyn-multi", name: "Multivitamin", subtitle: "Supradyn", price: 95, tag: "OTC", highlight: "In Stock (60)", accent: "from-primary/15 to-accent/15", image: "/images/products/vitamin_d3.png" },
  { id: "cough-syrup-benadryl", name: "Cough Syrup", subtitle: "Benadryl", price: 120, tag: "OTC", highlight: "In Stock (60)", accent: "from-primary/15 to-secondary/15", image: "/images/products/pain_patch.png" },
  { id: "esomeprazole", name: "Esomeprazole", subtitle: "Generic", price: 65, tag: "Rx", highlight: "In Stock (50)", accent: "from-secondary/15 to-primary/15", image: "/images/products/metformin.png" },
  { id: "ofloxacin", name: "Ofloxacin", subtitle: "Generic", price: 70, tag: "Rx", highlight: "In Stock (30)", accent: "from-accent/15 to-primary/15", image: "/images/products/syringes.png" },
  { id: "glimepiride", name: "Glimepiride", subtitle: "Generic", price: 45, tag: "Rx", highlight: "In Stock (40)", accent: "from-primary/10 to-accent/20", image: "/images/products/metformin.png" },
  { id: "calpol", name: "Calpol", subtitle: "GSK", price: 32, tag: "OTC", highlight: "In Stock (60)", accent: "from-secondary/10 to-accent/20", image: "/images/products/metformin.png" },
  { id: "ibuprofen-400", name: "Ibuprofen 400mg", subtitle: "Generic", price: 22, tag: "OTC", highlight: "In Stock (70)", accent: "from-primary/10 to-secondary/20", image: "/images/products/metformin.png" },
  { id: "thyroxine", name: "Thyroxine", subtitle: "Abbott", price: 25, tag: "Rx", highlight: "In Stock (80)", accent: "from-accent/10 to-secondary/20", image: "/images/products/metformin.png" },
  { id: "levofloxacin", name: "Levofloxacin", subtitle: "Generic", price: 120, tag: "Rx", highlight: "In Stock (20)", accent: "from-primary/15 to-accent/15", image: "/images/products/syringes.png" },
  { id: "metformin-500", name: "Metformin 500mg", subtitle: "Generic", price: 35, tag: "Rx", highlight: "In Stock (60)", accent: "from-primary/15 to-secondary/15", image: "/images/products/metformin.png" },
  { id: "azithromycin-500", name: "Azithromycin 500mg", subtitle: "Generic", price: 85, tag: "Rx", highlight: "In Stock (45)", accent: "from-secondary/15 to-primary/15", image: "/images/products/syringes.png" },
  { id: "iron-tablets", name: "Iron Tablets", subtitle: "Feronia", price: 45, tag: "OTC", highlight: "In Stock (80)", accent: "from-accent/15 to-primary/15", image: "/images/products/vitamin_d3.png" },
  { id: "ascoril-syrup", name: "Ascoril", subtitle: "Glenmark", price: 135, tag: "Rx", highlight: "In Stock (40)", accent: "from-primary/10 to-accent/20", image: "/images/products/pain_patch.png" },
  { id: "dolo-650", name: "Dolo 650", subtitle: "Micro Labs", price: 35, tag: "OTC", highlight: "In Stock (80)", accent: "from-secondary/10 to-accent/20", image: "/images/products/metformin.png" }
];

const Store = () => {
  const { addItem } = useCart();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedMeds, setExtractedMeds] = useState<any[]>([]);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsAnalyzing(true);
      // Simulating AI analysis with the exact data from screenshot
      setTimeout(() => {
        const found = [
          { id: "pantoprazole", name: "Pertoprazae", subtitle: "40mg", price: 80 },
          { id: "atorvastatin", name: "Aorastain", subtitle: "10mg", price: 80 },
          { id: "losartan", name: "Losatan", subtitle: "50mg", price: 150 }
        ];
        setExtractedMeds(found);
        setIsAnalyzing(false);
        toast.success("Prescription analyzed successfully!");
      }, 2000);
    }
  };

  const addAllToCart = () => {
    extractedMeds.forEach(med => {
      addItem({ id: med.id, name: med.name, price: med.price, note: med.subtitle });
    });
    toast.success(`${extractedMeds.length} items added to cart`);
    setExtractedMeds([]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
<main className="pt-28 pb-24">
      <section className="container mx-auto px-6">
        <div className="rounded-[2.5rem] border border-border/60 bg-gradient-to-br from-card via-background to-card/70 p-8 md:p-12 shadow-xl shadow-primary/5 relative overflow-hidden">
          <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-secondary/10 blur-[110px]" />
          <div className="relative z-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                <ShoppingBag className="w-4 h-4" />
                Arogya Pharmacy
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mt-6 leading-tight">
                Your trusted place for medicines, injections, and daily care.
              </h1>
              <p className="text-lg text-muted-foreground mt-4 max-w-xl">
                Curated essentials with verified sourcing, fast delivery, and prescription-safe checks.
              </p>

              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Secure sourcing
                </div>
                <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2">
                  <BadgeCheck className="w-4 h-4 text-primary" />
                  Rx validation
                </div>
                <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2">
                  <Truck className="w-4 h-4 text-primary" />
                  Same-day dispatch
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border/60 bg-card/80 p-6 shadow-lg shadow-primary/5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Quick Search</p>
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Search medicines, devices, injections..."
                />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className="rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-muted-foreground hover:text-foreground transition"
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Today’s Picks</p>
                <p className="text-lg font-semibold mt-2">Glucose Monitoring Bundle</p>
                <p className="text-xs text-muted-foreground mt-1">Monitor + strips + lancets • ₹3,799</p>
                <button className="mt-4 w-full rounded-xl bg-primary text-primary-foreground py-2 text-sm font-semibold">
                  View bundle
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 mt-14">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-semibold">Featured Products</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HeartPulse className="w-4 h-4 text-primary" />
            Verified health essentials
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.name}
              className="group rounded-3xl border border-border/60 bg-card/80 p-5 shadow-lg shadow-primary/5 hover:shadow-xl transition duration-300"
            >
              <div className={`h-40 rounded-2xl bg-gradient-to-br ${product.accent} flex items-center justify-center overflow-hidden`}>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{product.tag}</p>
                  <span className="text-xs font-semibold text-primary">{product.highlight}</span>
                </div>
                <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.subtitle}</p>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-lg font-semibold">₹{product.price}</p>
                  <button
                    className="rounded-xl border border-border/60 bg-background/70 px-3 py-2 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition"
                    onClick={() => {
                      addItem({ id: product.id, name: product.name, price: product.price, note: product.subtitle });
                      toast(`${product.name} added to cart`);
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 mt-16">
        <div className="rounded-[2.5rem] border border-border/60 bg-gradient-to-br from-[#1a3a5f] to-[#0ea5a4]/20 p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 grid lg:grid-cols-[1fr_1.2fr] gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                <FileText className="w-4 h-4" />
                Neural Prescription Scan
              </div>
              <h3 className="text-3xl font-bold text-white mt-6">Upload Prescription for Analysis</h3>
              <p className="text-white/70 mt-4 leading-relaxed">
                Our AI instantly scans your prescription to identify medicines, dosages, and costs. 
                Order everything in one click with verified pharmaceutical matching.
              </p>
              
              <div className="mt-10 space-y-4">
                {[
                  "Recognizes handwritten prescriptions",
                  "Checks for generic alternatives",
                  "Verified pharmacist review"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-white/80 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div 
                className={`rounded-[2rem] border-2 border-dashed border-white/20 bg-white/5 p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/10 transition-all group ${isAnalyzing ? "pointer-events-none" : ""}`}
                onClick={() => !isAnalyzing && fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf,image/*" 
                  onChange={handleFileSelect}
                  title="Upload prescription"
                />
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-white">Drop PDF or image here</h4>
                <p className="text-white/40 text-sm mt-2">Max 10 MB • JPG, PNG, PDF</p>
                <div className="mt-6 px-6 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest">
                  Analyze prescription
                </div>
                <p className="text-[10px] text-white/30 mt-4 uppercase tracking-widest font-black">This is demo-only. No files are uploaded.</p>
              </div>

              <AnimatePresence>
                {(isAnalyzing || extractedMeds.length > 0) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-xl p-6 shadow-2xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-bold text-white">Analysis Result</h4>
                      <button 
                        onClick={() => {
                          setExtractedMeds([]);
                          setFilePreview(null);
                        }}
                        className="text-white/40 hover:text-white transition-colors"
                        title="Clear results"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-[150px_1fr] gap-6">
                      {filePreview && (
                        <div className="h-[200px] rounded-xl border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center">
                          {filePreview === 'pdf' ? (
                            <div className="flex flex-col items-center gap-2">
                              <FileText className="w-12 h-12 text-white/20" />
                              <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">PDF Document</span>
                            </div>
                          ) : (
                            <img src={filePreview} alt="Prescription" className="w-full h-full object-cover opacity-60" />
                          )}
                        </div>
                      )}
                      
                      <div className="flex-1">
                        {isAnalyzing ? (
                          <div className="py-12 flex flex-col items-center justify-center">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                            <p className="text-white/60 font-semibold animate-pulse text-sm">Analyzing prescription...</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                              {extractedMeds.map((med, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                  <div>
                                    <h5 className="font-bold text-white text-xs">{med.name}</h5>
                                    <p className="text-[10px] text-white/40">{med.subtitle}</p>
                                  </div>
                                  <span className="text-white font-black text-xs">₹{med.price}</span>
                                </div>
                              ))}
                            </div>
                            
                            <div className="pt-4 border-t border-white/10 flex items-center justify-between mb-4">
                              <span className="text-white/60 text-sm">Total Cost</span>
                              <span className="text-2xl font-black text-white">₹{extractedMeds.reduce((sum, m) => sum + m.price, 0)}</span>
                            </div>

                            <button 
                              onClick={addAllToCart}
                              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-black text-xs tracking-widest uppercase hover:scale-[1.02] transition-all shadow-xl shadow-primary/20"
                            >
                              Add All & Order Now
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
      <section className="container mx-auto px-6 mt-16 mb-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="rounded-3xl border border-border/60 bg-card/70 p-8 text-center hover:bg-card transition duration-300">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Care Assurance</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              100% genuine medicines sourced directly from authorized manufacturers and verified pharmacies.
            </p>
          </div>
          <div className="rounded-3xl border border-border/60 bg-card/70 p-8 text-center hover:bg-card transition duration-300">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
              <Truck className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Swift Delivery</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Express 24-hour delivery across all major cities with real-time temperature-controlled logistics.
            </p>
          </div>
          <div className="rounded-3xl border border-border/60 bg-card/70 p-8 text-center hover:bg-card transition duration-300">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
              <BadgeCheck className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-3">Expert Support</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              24/7 access to licensed pharmacists for drug interaction checks and dosage clarification.
            </p>
          </div>
        </div>
      </section>
      </main>
</div>
  );
};

export default Store;
