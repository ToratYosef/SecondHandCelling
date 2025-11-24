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
    <>
      {/* Main header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity rounded-md px-2 py-1 -ml-2" data-testid="link-home">
            {logoUrl ? (
              <img src={logoUrl} alt="Site Logo" className="h-8 mr-2" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
            )}
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">SecondHandCell</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/sell" className="text-sm font-medium transition-colors hover:text-primary relative group" data-testid="link-sell">
              Sell Device
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium transition-colors hover:text-primary relative group" data-testid="link-how-it-works">
              How It Works
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/faq" className="text-sm font-medium transition-colors hover:text-primary relative group" data-testid="link-faq">
              FAQ
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="hidden md:flex hover:bg-primary/5" data-testid="button-track-order">
              <Link href="/track">
                Track Order
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-md hover:shadow-lg transition-all duration-300" data-testid="button-get-offer">
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
                  <Link href="/sell" className="text-lg font-medium hover:text-primary transition-colors" data-testid="link-mobile-sell">
                    Sell Device
                  </Link>
                  <Link href="/how-it-works" className="text-lg font-medium hover:text-primary transition-colors" data-testid="link-mobile-how-it-works">
                    How It Works
                  </Link>
                  <Link href="/faq" className="text-lg font-medium hover:text-primary transition-colors" data-testid="link-mobile-faq">
                    FAQ
                  </Link>
                  <Link href="/track" className="text-lg font-medium hover:text-primary transition-colors" data-testid="link-mobile-track">
                    Track Order
                  </Link>
                  <Link href="/login" className="text-lg font-medium hover:text-primary transition-colors" data-testid="link-mobile-login">
                    Sign In
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
