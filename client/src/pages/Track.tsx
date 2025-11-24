import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, Clock, Truck, DollarSign, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function Track() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [searchParams, setSearchParams] = useState({ orderNumber: "", email: "" });

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["/api/orders/by-number", searchParams.orderNumber],
    queryFn: async () => {
      const res = await fetch(`/api/orders/by-number/${searchParams.orderNumber}`);
      if (!res.ok) throw new Error("Order not found");
      return res.json();
    },
    enabled: submitted && !!searchParams.orderNumber,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ orderNumber, email });
    setSubmitted(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-6 h-6 text-yellow-500" />;
      case "shipped": return <Truck className="w-6 h-6 text-blue-500" />;
      case "inspecting": return <Package className="w-6 h-6 text-purple-500" />;
      case "approved": return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "paid": return <DollarSign className="w-6 h-6 text-green-600" />;
      default: return <AlertCircle className="w-6 h-6 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      <main className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <section className="py-16 relative overflow-hidden">
          {/* Dark luxury background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
            <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-block p-4 bg-blue-500/10 backdrop-blur-md rounded-full mb-6">
                <Package className="w-16 h-16 text-blue-400 animate-pulse" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-white animate-in fade-in duration-700">
                Track Your Order
              </h1>
              <p className="text-xl text-white/60">
                Enter your order or quote number and email to check the status
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background relative">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="max-w-md mx-auto">
              <Card className="p-8 backdrop-blur-md bg-card/50 border-border/50 hover:shadow-2xl transition-all duration-500">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="orderNumber">Order or Quote Number *</Label>
                    <Input 
                      id="orderNumber"
                      required
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="SHC-S-000123 or SHC-Q-000456"
                      data-testid="input-order-number"
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary"
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      data-testid="input-email"
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 hover:scale-105 transition-all duration-300" data-testid="button-track-order">
                    {isLoading ? "Searching..." : "Track Order"}
                  </Button>
                </form>

                {error && submitted && (
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-500 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">Order not found. Please check your order number and email.</p>
                  </div>
                )}

                {order && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-500 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Order Status</span>
                        {getStatusIcon(order.status)}
                      </div>
                      <p className="text-lg font-bold capitalize">{order.status}</p>
                      <p className="text-xs text-muted-foreground mt-1">Order #{order.orderNumber}</p>
                    </div>
                    
                    {order.totalOriginalOffer && (
                      <div className="p-4 backdrop-blur-md bg-card/50 border border-border/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Original Offer</p>
                        <p className="text-2xl font-bold">${order.totalOriginalOffer.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-border text-center">
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
