import { Link } from "wouter";
import { Smartphone, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PublicFooter() {
  return (
    <footer className="border-t bg-gradient-to-b from-muted/40 to-muted/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        {/* Top section with logo and tagline */}
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">SecondHandCell</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Turn your used devices into cash with instant quotes, free shipping, and honest inspections. We've paid out over $50M to satisfied sellers.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4 text-primary" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4 text-primary" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4 text-primary" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Linkedin className="w-4 h-4 text-primary" />
              </a>
            </div>
          </div>

          {/* Links grid */}
          <div>
            <h3 className="font-semibold mb-4">Products</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/sell" className="hover:text-primary transition-colors" data-testid="link-footer-sell">
                  Sell Device
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-primary transition-colors" data-testid="link-footer-apple">
                  iPhone
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-primary transition-colors" data-testid="link-footer-samsung">
                  Samsung
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-primary transition-colors">
                  Google Pixel
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/how-it-works" className="hover:text-primary transition-colors" data-testid="link-footer-how-it-works">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-primary transition-colors" data-testid="link-footer-track">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors" data-testid="link-footer-faq">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-primary transition-colors" data-testid="link-footer-support">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/data-wipe" className="hover:text-primary transition-colors" data-testid="link-footer-data-wipe">
                  Data Wipe Guide
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-primary transition-colors" data-testid="link-footer-terms">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-primary transition-colors" data-testid="link-footer-privacy">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter section */}
        <div className="mb-8 pb-8 border-b border-border/50">
          <div className="max-w-2xl">
            <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Get the Best Offers First</h3>
            <p className="text-sm text-muted-foreground mb-4">Subscribe to our newsletter for exclusive deals and device selling tips.</p>
            <div className="flex gap-2">
              <Input placeholder="Enter your email" type="email" className="flex-1" />
              <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">Subscribe</Button>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="grid md:grid-cols-3 gap-6 mb-8 pt-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm mb-1">Call Us</p>
              <p className="text-sm text-muted-foreground">1-800-SELL-PHONE</p>
              <p className="text-xs text-muted-foreground">Mon-Fri 9am-6pm EST</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm mb-1">Email Us</p>
              <p className="text-sm text-muted-foreground">support@secondhandcell.com</p>
              <p className="text-xs text-muted-foreground">24hr response time</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm mb-1">Headquarters</p>
              <p className="text-sm text-muted-foreground">San Francisco, CA</p>
              <p className="text-xs text-muted-foreground">USA</p>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} SecondHandCell. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              All systems operational
            </span>
            <span>🔒 Secure checkout</span>
            <span>✓ BBB Accredited</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
