import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { useState } from "react";

export default function Track() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <Package className="w-16 h-16 text-primary mx-auto mb-6" />
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Track Your Order
              </h1>
              <p className="text-xl text-muted-foreground">
                Enter your order or quote number and email to check the status
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="max-w-md mx-auto">
              <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="orderNumber">Order or Quote Number *</Label>
                    <Input 
                      id="orderNumber"
                      required
                      placeholder="SHC-S-000123 or SHC-Q-000456"
                      data-testid="input-order-number"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      You can find this in your confirmation email
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input 
                      id="email"
                      type="email"
                      required
                      placeholder="your@email.com"
                      data-testid="input-email"
                    />
                  </div>

                  <Button type="submit" className="w-full" data-testid="button-track-order">
                    Track Order
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Have an account?
                  </p>
                  <a href="/login" className="text-primary hover:underline text-sm font-medium">
                    Sign in to view all your orders
                  </a>
                </div>
              </Card>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Don't have an order or quote number yet?
                </p>
                <a href="/sell">
                  <Button variant="outline" data-testid="button-start-quote">
                    Start a New Quote
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
