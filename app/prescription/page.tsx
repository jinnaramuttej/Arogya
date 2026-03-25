"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, ShoppingCart, Tag, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";

// Live Database Integrator
interface Product {
  id: string;
  name: string;
  category: string;
  dosage: string;
  price: number;
  img: string;
}

const EPrescription = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const { addItem, items, count } = useCart();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchInventory = async () => {
      setLoadingProducts(true);
      const { data } = await supabase.from('medications').select('*').order('name');
      if (data) setProducts(data as Product[]);
      setLoadingProducts(false);
    };
    fetchInventory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = activeCategory === "All" || p.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory, products]);

  const handleAddToCart = (product: Product) => {
    addItem(
      { id: product.id, name: product.name, price: product.price, note: product.dosage },
      1
    );
    toast.success(`${product.name} added to cart!`, {
      action: { label: "View Cart", onClick: () => router.push("/cart") },
    });
  };

  const getCartQty = (productId: string) =>
    items.find((i) => i.id === productId)?.qty ?? 0;

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
            
            {/* Search, Filter and Cart */}
            <div className="w-full md:w-auto space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input 
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-80 rounded-2xl border border-border/60 bg-card/50 px-12 py-3 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <button
                  onClick={() => router.push("/cart")}
                  className="relative flex items-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 text-primary px-4 py-3 text-sm font-semibold hover:bg-primary hover:text-white transition-all"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {count > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{count}</span>
                  )}
                  Cart
                </button>
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
          {loadingProducts ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
              <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
              <span className="text-lg font-medium">Synchronizing Inventory...</span>
            </div>
          ) : (
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
                    {getCartQty(product.id) > 0 ? (
                      <div className="flex items-center gap-1 rounded-xl border border-primary/40 bg-primary/10 px-2 py-1">
                        <button
                          onClick={() => addItem({ id: product.id, name: product.name, price: product.price, note: product.dosage }, -1)}
                          className="w-6 h-6 rounded-lg text-primary font-bold hover:bg-primary/20 transition-all"
                        >−</button>
                        <span className="text-sm font-bold text-primary w-5 text-center">{getCartQty(product.id)}</span>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-6 h-6 rounded-lg text-primary font-bold hover:bg-primary/20 transition-all"
                        >+</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex items-center gap-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 text-sm font-semibold transition-all"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}

          {!loadingProducts && filteredProducts.length === 0 && (
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
