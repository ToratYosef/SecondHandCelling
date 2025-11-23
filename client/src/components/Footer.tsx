import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Products</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/sell" className="hover:text-primary transition-colors" data-testid="link-footer-sell-phone">
                  Sell Phone
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-primary transition-colors" data-testid="link-footer-sell-tablet">
                  Sell Tablet
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-primary transition-colors" data-testid="link-footer-sell-watch">
                  Sell Watch
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/how-it-works" className="hover:text-primary transition-colors" data-testid="link-footer-how-it-works">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors" data-testid="link-footer-faq">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/support" className="hover:text-primary transition-colors" data-testid="link-footer-contact">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-primary transition-colors" data-testid="link-footer-track-order">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/data-wipe" className="hover:text-primary transition-colors" data-testid="link-footer-data-wipe">
                  Data Wipe Guide
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
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

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SecondHandCell. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
