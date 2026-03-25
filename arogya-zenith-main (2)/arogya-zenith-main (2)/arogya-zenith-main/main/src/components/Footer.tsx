import { Heart, Github, Twitter, Linkedin, Send, Activity } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="relative py-24 border-t border-border/50 bg-card" aria-labelledby="footer-heading">
    <h2 id="footer-heading" className="sr-only">Footer</h2>
    <div className="container mx-auto px-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
        {/* Column 1: Brand & About */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Activity className="text-white w-6 h-6" />
            </div>
            <span className="font-heading text-2xl font-bold tracking-tight">Arogya<span className="text-primary">Zenith</span></span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Leading the digital healthcare revolution with AI-driven intelligence and decentralized networks.
          </p>
          <div className="flex items-center gap-4">
            {[Twitter, Linkedin, Github].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all duration-300">
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: Navigation */}
        <div className="md:col-span-4 grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-6">
            <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-foreground">Platform</h3>
            <nav className="flex flex-col gap-4 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-primary transition-colors">Features</a>
              <a href="#" className="hover:text-primary transition-colors">SOS Dispatch</a>
              <a href="#" className="hover:text-primary transition-colors">Blood Oasis</a>
            </nav>
          </div>
          <div className="flex flex-col gap-6">
            <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-foreground">Legal</h3>
            <nav className="flex flex-col gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Security</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
            </nav>
          </div>
        </div>

        {/* Column 3: Newsletter */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-foreground">Subscribe</h3>
          <p className="text-sm text-muted-foreground">
            Get the latest updates on AI healthcare and network expansion.
          </p>
          <form className="flex gap-2" role="form" aria-label="Newsletter Subscription">
            <input
              type="email"
              required
              placeholder="Email address"
              className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button
              type="submit"
              className="bg-primary text-white rounded-xl px-5 py-3 hover:opacity-90 transition-all flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="mt-20 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-xs text-muted-foreground font-medium">
          © {new Date().getFullYear()} Arogya Zenith. Powered by Neural Systems.
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          Encrypted with <Heart className="w-3 h-3 text-primary fill-primary" /> for your security
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
