"use client";

import { useState, useMemo } from "react";
import { Search, ShoppingCart, Filter, Tag, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/useUser";
import { useRouter } from "next/navigation";

const products = [
  { id: "bp-1", name: "Omron Blood Pressure Monitor", category: "Devices", dosage: "N/A", price: 2499, img: "/images/products/bp_monitor.png" },
  { id: "el-2", name: "Electrolytes Powder", category: "Supplements", dosage: "1 Sachet/day", price: 350, img: "/images/products/electrolytes.png" },
  { id: "fa-3", name: "Comprehensive First Aid Kit", category: "Devices", dosage: "N/A", price: 1200, img: "/images/products/first_aid_kit.png" },
  { id: "in-4", name: "Insulin Glargine Pen", category: "Prescription", dosage: "As prescribed", price: 850, img: "/images/products/insulin.png" },
  { id: "me-5", name: "Metformin XR 500mg", category: "Prescription", dosage: "500mg tablet", price: 120, img: "/images/products/metformin.png" },
  { id: "pa-6", name: "Lidocaine Pain Relief Patch", category: "Supplements", dosage: "1 patch/12 hrs", price: 450, img: "/images/products/pain_patch.png" },
  { id: "sy-7", name: "Sterile Insulin Syringes", category: "Devices", dosage: "N/A", price: 299, img: "/images/products/syringes.png" },
  { id: "vd-8", name: "Vitamin D3 60K IU", category: "Supplements", dosage: "1 cap/week", price: 180, img: "/images/products/vitamin_d3.png" }
];

const EPrescription = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [purchasing, setPurchasing] = useState<string | null>(null);
  
  const { user } = useUser();
  const supabase = createClient();
  const router = useRouter();

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = activeCategory === "All" || p.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory]);

  const handleBuy = async (product: typeof products[0]) => {
    if (!user) {
      toast.error("Please log in to make a purchase.");
      router.push("/auth");
      return;
    }
    setPurchasing(product.id);
    
    const { error } = await supabase.from('user_prescriptions').insert([{
      user_id: user.id,
      medication_name: product.name,
      dosage: product.dosage,
      price: product.price,
      status: 'pending'
    }]);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${product.name} ordered! Check your dashboard.`);
    }
    setPurchasing(null);
  };

  const categories = ["All", "Prescription", "Supplements", "Devices"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="pt-28 pb-24">
        {/* Header Section */}
        <section className="container mx-auto px-6 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border/40 pb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary mb-4">
                <ShoppingCart className="w-4 h-4" />
                Arogya E-Pharmacy
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Authentic Medicines <br className="hidden md:block"/> Delivered Fast.
              </h1>
              <p className="text-lg text-muted-foreground mt-4 max-w-xl">
                Order prescriptions, medical devices, and health supplements securely with AI-verified routing.
              </p>
            </div>
            
            {/* Search and Filter */}
            <div className="w-full md:w-auto space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-80 rounded-2xl border border-border/60 bg-card/50 px-12 py-3 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                      activeCategory === cat 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "bg-card/50 border border-border/50 text-muted-foreground hover:bg-card"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="group relative flex flex-col rounded-[2rem] border border-border/50 bg-card/30 p-4 transition-all hover:bg-card/80 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="absolute top-6 left-6 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-background/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm">
                    <Tag className="w-3 h-3" />
                    {product.category}
                  </span>
                </div>
                
                <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-white mb-4 p-6 flex items-center justify-center border border-black/5">
                  <img 
                    src={product.img} 
                    alt={product.name}
                    className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                
                <div className="flex flex-col flex-grow px-2">
                  <h3 className="font-semibold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {product.dosage}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <p className="text-xl font-bold tracking-tight">
                      ₹{product.price}
                    </p>
                    <button
                      onClick={() => handleBuy(product)}
                      disabled={purchasing === product.id}
                      className="rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {purchasing === product.id ? "Processing..." : "Buy Now"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-20 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 text-muted-foreground">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground max-w-sm">We couldn't find anything matching "{searchQuery}" in {activeCategory}.</p>
              <button 
                onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                className="mt-6 text-primary font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default EPrescription;
