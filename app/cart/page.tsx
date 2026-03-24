"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, MapPin, Package, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "@/lib/cart";

const steps = [
  { id: "cart", label: "Cart", icon: ShoppingBag },
  { id: "address", label: "Address", icon: MapPin },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "review", label: "Review", icon: CheckCircle2 },
  { id: "delivery", label: "Delivery", icon: Truck }
];

const Cart = () => {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const { items, updateQty, removeItem, clear } = useCart();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.qty, 0), [items]);
  const delivery = 49;
  const total = subtotal + delivery;
  const canContinue = items.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
<main className="pt-28 pb-24">
        <section className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Checkout</p>
              <h1 className="text-4xl md:text-5xl font-bold mt-3">Cart & Delivery</h1>
              <p className="text-lg text-muted-foreground mt-3">
                A guided flow from cart to doorstep tracking.
              </p>
            </div>
            <button
              onClick={() => router.push("/store")}
              className="rounded-xl border border-border/60 bg-card/70 px-4 py-2 text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition"
            >
              Continue shopping
            </button>
          </div>

          <div className="mt-10 rounded-[2rem] border border-border/60 bg-card/80 p-6">
            <div className="grid grid-cols-5 gap-4">
              {steps.map((s, i) => (
                <div key={s.id} className="flex flex-col items-center text-center">
                  <div
                    className={`h-11 w-11 rounded-2xl flex items-center justify-center border ${
                      i <= step ? "bg-primary text-primary-foreground border-primary" : "bg-background/70 border-border/60 text-muted-foreground"
                    }`}
                  >
                    <s.icon className="h-5 w-5" />
                  </div>
                  <p className={`mt-2 text-xs font-semibold ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
            <div className="rounded-3xl border border-border/60 bg-card/80 p-7">
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Cart items</h2>
                  {items.length === 0 ? (
                    <div className="rounded-2xl border border-border/60 bg-background/70 p-6 text-sm text-muted-foreground">
                      Your cart is empty. Add products from the Health Store or E‑Prescription.
                    </div>
                  ) : (
                    items.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-border/60 bg-background/70 p-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          {item.note && <p className="text-xs text-muted-foreground">{item.note}</p>}
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              className="h-7 w-7 rounded-lg border border-border/60"
                              onClick={() => updateQty(item.id, item.qty - 1)}
                            >
                              -
                            </button>
                            <span className="text-sm font-semibold">{item.qty}</span>
                            <button
                              className="h-7 w-7 rounded-lg border border-border/60"
                              onClick={() => updateQty(item.id, item.qty + 1)}
                            >
                              +
                            </button>
                            <button
                              className="ml-3 text-xs text-muted-foreground hover:text-foreground"
                              onClick={() => removeItem(item.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <p className="text-sm font-semibold">₹{item.price * item.qty}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Delivery address</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input className="input-field" placeholder="Full name" />
                    <input className="input-field" placeholder="Phone number" />
                  </div>
                  <input className="input-field" placeholder="Address line 1" />
                  <input className="input-field" placeholder="Address line 2" />
                  <div className="grid sm:grid-cols-3 gap-4">
                    <input className="input-field" placeholder="City" />
                    <input className="input-field" placeholder="State" />
                    <input className="input-field" placeholder="Pincode" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Payment</h2>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4 space-y-3">
                    <input className="input-field" placeholder="Card number" />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <input className="input-field" placeholder="MM / YY" />
                      <input className="input-field" placeholder="CVV" />
                    </div>
                    <input className="input-field" placeholder="Name on card" />
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                    UPI and Netbanking available at checkout.
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Review & confirm</h2>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                    Delivery to: Aarav Mehta, 12, Residency Road, Bengaluru, 560001
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                    Payment method: Card ending ••42
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-sm font-semibold">Order summary</p>
                    <p className="text-xs text-muted-foreground mt-1">3 items • Delivery in 24-48 hrs</p>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Order on the way</h2>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
                    <div className="flex items-center gap-3">
                      <Package className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-semibold">Expected delivery</p>
                        <p className="text-sm text-muted-foreground">Mar 27, 2026 • 6:00 PM - 8:00 PM</p>
                      </div>
                    </div>
                    <div className="mt-5 h-2 rounded-full bg-muted/60">
                      <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-primary to-secondary" />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Packed</span>
                      <span>In transit</span>
                      <span>Out for delivery</span>
                      <span>Delivered</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  disabled={step === 0}
                  onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
                  className="rounded-xl border border-border/60 bg-card/70 px-4 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  Back
                </button>
                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => setStep((prev) => Math.min(prev + 1, 4))}
                    className="rounded-xl bg-primary text-primary-foreground px-6 py-2 text-sm font-semibold disabled:opacity-50"
                    disabled={!canContinue}
                  >
                    {step === 3 ? "Place order" : "Continue"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push("/store")}
                    className="rounded-xl bg-primary text-primary-foreground px-6 py-2 text-sm font-semibold"
                  >
                    Shop more
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card/80 p-7 h-fit">
              <h3 className="text-xl font-semibold">Order summary</h3>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery</span>
                  <span>₹{delivery}</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
              {items.length > 0 && (
                <button
                  className="mt-5 w-full rounded-xl border border-border/60 bg-card/70 py-2 text-sm font-semibold hover:bg-muted"
                  onClick={() => clear()}
                >
                  Clear cart
                </button>
              )}
              <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                Safe packaging for temperature-sensitive medicines included by default.
              </div>
            </div>
          </div>
        </section>
      </main>
</div>
  );
};

export default Cart;
