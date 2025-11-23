import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Smartphone, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function PublicHeader() {
  const [logoUrl, setLogoUrl] = useState<string>("");
  useState(() => {
    fetch("/api/settings").then(res => res.json()).then(data => {
      if (data.logoUrl) setLogoUrl(data.logoUrl);
    });
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1" data-testid="link-home">
          {logoUrl ? (
            <img src={logoUrl} alt="Site Logo" className="h-8 mr-2" />
          ) : (
            <Smartphone className="h-6 w-6 text-primary" />
          )}
          <span className="text-xl font-bold tracking-tight">SecondHandCell</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/sell" className="text-sm font-medium transition-colors hover:text-primary" data-testid="link-sell">
            Sell Device
          </Link>
          <Link href="/how-it-works" className="text-sm font-medium transition-colors hover:text-primary" data-testid="link-how-it-works">
            How It Works
          </Link>
          <Link href="/faq" className="text-sm font-medium transition-colors hover:text-primary" data-testid="link-faq">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="hidden md:flex" data-testid="button-track-order">
            <Link href="/track">
              Track Order
            </Link>
          </Button>
          <Button asChild size="sm" data-testid="button-get-offer">
            <Link href="/sell">
              Get an Offer
            </Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" data-testid="button-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/sell" className="text-lg font-medium" data-testid="link-mobile-sell">
                  Sell Device
                </Link>
                <Link href="/how-it-works" className="text-lg font-medium" data-testid="link-mobile-how-it-works">
                  How It Works
                </Link>
                <Link href="/faq" className="text-lg font-medium" data-testid="link-mobile-faq">
                  FAQ
                </Link>
                <Link href="/track" className="text-lg font-medium" data-testid="link-mobile-track">
                  Track Order
                </Link>
                <Link href="/login" className="text-lg font-medium" data-testid="link-mobile-login">
                  Sign In
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
