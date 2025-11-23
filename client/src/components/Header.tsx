import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>("");
  // Fetch sitewide logo
  useState(() => {
    fetch("/api/settings").then(res => res.json()).then(data => {
      if (data.logoUrl) setLogoUrl(data.logoUrl);
    });
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Site Logo" className="h-8 mr-2" />
            ) : (
              <span className="text-2xl font-bold text-primary">SecondHandCell</span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/how-it-works" className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-how-it-works">
              How It Works
            </Link>
            <Link href="/faq" className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-faq">
              FAQ
            </Link>
            <Link href="/data-wipe" className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-data-wipe">
              Data Wipe
            </Link>
            <Link href="/support" className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-support">
              Support
            </Link>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="outline" data-testid="button-track-order">
              <Link href="/track">
                Track Order
              </Link>
            </Button>
            <Button asChild data-testid="button-get-offer">
              <Link href="/sell">
                Get Offer
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t">
            <Link href="/how-it-works" className="block py-2 text-sm font-medium hover:text-primary" data-testid="link-mobile-how-it-works">
              How It Works
            </Link>
            <Link href="/faq" className="block py-2 text-sm font-medium hover:text-primary" data-testid="link-mobile-faq">
              FAQ
            </Link>
            <Link href="/data-wipe" className="block py-2 text-sm font-medium hover:text-primary" data-testid="link-mobile-data-wipe">
              Data Wipe
            </Link>
            <Link href="/support" className="block py-2 text-sm font-medium hover:text-primary" data-testid="link-mobile-support">
              Support
            </Link>
            <div className="flex flex-col space-y-2 pt-4">
              <Button asChild variant="outline" className="w-full" data-testid="button-mobile-track-order">
                <Link href="/track">
                  Track Order
                </Link>
              </Button>
              <Button asChild className="w-full" data-testid="button-mobile-get-offer">
                <Link href="/sell">
                  Get Offer
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
