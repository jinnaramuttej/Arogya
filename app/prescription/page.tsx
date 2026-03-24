"use client";

import { FileUp, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "@/lib/cart";
import { toast } from "@/components/ui/sonner";

const recommendations = [
  { id: "metformin-xr", name: "Metformin XR 500 mg", note: "30 tablets • Rx", price: 420 },
  { id: "glucose-strips", name: "Blood Glucose Strips", note: "50 strips • Device", price: 699 },
  { id: "vitamin-d3", name: "Vitamin D3 1000 IU", note: "60 caps • OTC", price: 399 }
];

const EPrescription = () => {
  const { addItem } = useCart();
  return (
    <div className="min-h-screen bg-background text-foreground">
<main className="pt-28 pb-24">
      <section className="container mx-auto px-6">
        <div className="rounded-[2.5rem] border border-border/60 bg-gradient-to-br from-card via-background to-card/70 p-8 md:p-12 shadow-xl shadow-primary/5 relative overflow-hidden">
          <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-secondary/10 blur-[110px]" />
          <div className="relative z-10 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                <Sparkles className="w-4 h-4" />
                E-Prescription Assistant
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mt-6 leading-tight">
                Upload your prescription and get a personalized summary + product list.
              </h1>
              <p className="text-lg text-muted-foreground mt-4 max-w-xl">
                Our AI extracts medicines, dosage, and care notes, then recommends verified products you can
                purchase instantly.
              </p>

              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Prescription-safe review
                </div>
                <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  Add to cart in one click
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border/60 bg-card/80 p-6 shadow-lg shadow-primary/5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Upload Prescription</p>
              <label className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/70 px-6 py-8 text-center cursor-pointer hover:border-primary/40 transition">
                <FileUp className="w-6 h-6 text-primary" />
                <span className="mt-3 text-sm font-semibold">Drop PDF or image here</span>
                <span className="text-xs text-muted-foreground mt-1">Max 10 MB • JPG, PNG, PDF</span>
                <input type="file" className="hidden" />
              </label>
              <button className="mt-5 w-full rounded-xl bg-primary text-primary-foreground py-2 text-sm font-semibold">
                Analyze prescription
              </button>
              <p className="text-[11px] text-muted-foreground mt-3">
                This is demo-only. No files are uploaded.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 mt-14">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
          <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
            <h2 className="text-2xl font-semibold">AI Summary</h2>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Demo summary: Patient with Type 2 Diabetes and mild hypertension. Prescription includes Metformin XR 500 mg
              daily after breakfast, Vitamin D3 supplementation, and a follow-up lab panel in 6 weeks. Suggested focus
              on hydration and post-meal walks.
            </p>
            <div className="mt-5 rounded-2xl border border-border/60 bg-background/70 p-4 text-sm">
              Key instructions: Monitor fasting glucose, avoid excess sodium, and log daily steps.
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Recommended Products</h2>
              <button className="text-sm font-semibold text-primary hover:underline">View all</button>
            </div>
            <div className="mt-5 space-y-4">
              {recommendations.map((item) => (
                <div key={item.name} className="rounded-2xl border border-border/60 bg-background/70 p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.note}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">₹{item.price}</p>
                    <button
                      className="mt-2 rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition"
                      onClick={() => {
                        addItem({ id: item.id, name: item.name, price: item.price, note: item.note });
                        toast(`${item.name} added to cart`);
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
</div>
  );
};

export default EPrescription;
