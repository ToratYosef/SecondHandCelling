import { Link } from "wouter";
import { Smartphone } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/40 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        {/* Top section with logo and tagline */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">SecondHandCell</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Turn your used devices into cash with instant quotes, free shipping, and honest inspections.
          </p>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-semibold mb-4">Products</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/sell" className="hover:text-foreground transition-colors" data-testid="link-footer-sell">
                  Sell Device
                </Link>
              </li>
              <li>
                <Link href="/sell/brand/apple" className="hover:text-foreground transition-colors" data-testid="link-footer-apple">
                  iPhone
                </Link>
              </li>
              <li>
                <Link href="/sell/brand/samsung" className="hover:text-foreground transition-colors" data-testid="link-footer-samsung">
                  Samsung
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/how-it-works" className="hover:text-foreground transition-colors" data-testid="link-footer-how-it-works">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-foreground transition-colors" data-testid="link-footer-track">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/faq" className="hover:text-foreground transition-colors" data-testid="link-footer-faq">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-foreground transition-colors" data-testid="link-footer-support">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/data-wipe" className="hover:text-foreground transition-colors" data-testid="link-footer-data-wipe">
                  Data Wipe Guide
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/legal/terms" className="hover:text-foreground transition-colors" data-testid="link-footer-terms">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-foreground transition-colors" data-testid="link-footer-privacy">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="pt-8 border-t text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SecondHandCell. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
