import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Search, Lock, Package, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      <main className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Hero */}
        <section className="py-16 relative overflow-hidden">
          {/* Dark luxury background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
            <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-white animate-in fade-in duration-700">
                How It Works
              </h1>
              <p className="text-xl text-white/60 leading-relaxed">
                Selling your device to SecondHandCell is simple, safe, and fast. Here's our complete process from quote to payout.
              </p>
            </div>
          </div>
        </section>

        {/* Main Steps */}
        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto space-y-16">
              {/* Step 1 */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white flex items-center justify-center font-bold text-xl">
                      1
                    </div>
                    <Search className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Get Your Offer</h2>
                  <p className="text-muted-foreground mb-4">
                    Start by selecting your device brand and model. Tell us about the storage, carrier, and condition. Our smart quote calculator instantly evaluates your device based on current market demand and condition.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span>Answer a few simple questions about your device</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span>Get an instant quote in seconds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span>No personal information required to see pricing</span>
                    </li>
                  </ul>
                </div>
                <Card className="p-8 backdrop-blur-md bg-card/50 border-border/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="space-y-4">
                    <div className="p-4 bg-background/80 rounded-md border border-border/50 hover:border-primary/30 transition-colors">
                      <p className="text-sm font-medium mb-1">Device</p>
                      <p className="text-lg font-semibold">iPhone 14 Pro, 256GB</p>
                    </div>
                    <div className="p-4 bg-background/80 rounded-md border border-border/50 hover:border-primary/30 transition-colors">
                      <p className="text-sm font-medium mb-1">Condition</p>
                      <p className="text-lg font-semibold">Good</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-md shadow-lg hover:shadow-xl transition-shadow">
                      <p className="text-sm opacity-90 mb-1">Your Instant Offer</p>
                      <p className="text-3xl font-bold">$445</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Step 2 */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="md:order-2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white flex items-center justify-center font-bold text-xl">
                      2
                    </div>
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Lock In and Ship</h2>
                  <p className="text-muted-foreground mb-4">
                    Your quote is guaranteed for 14 days. Choose your shipping option and we'll provide everything you need to send your device safely.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span>Free prepaid shipping label (print at home)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span>Optional mail-in kit delivered to your door</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span>Track your shipment every step of the way</span>
                    </li>
                  </ul>
                </div>
                <Card className="p-8 backdrop-blur-md bg-card/50 border-border/50 md:order-1 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-background/80 rounded-md border border-border/50 hover:border-green-500/30 transition-colors">
                      <span className="font-medium">Print Label</span>
                      <span className="text-sm text-green-600 font-semibold">FREE</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background/80 rounded-md border border-border/50 hover:border-green-500/30 transition-colors">
                      <span className="font-medium">Mail-in Kit</span>
                      <span className="text-sm text-green-600 font-semibold">FREE</span>
                    </div>
                    <div className="p-4 bg-background/80 rounded-md border border-border/50 hover:border-primary/30 transition-colors">
                      <p className="text-sm text-muted-foreground mb-2">Offer expires</p>
                      <p className="font-semibold">14 days from lock-in</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Step 3 */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white flex items-center justify-center font-bold text-xl">
                      3
                    </div>
                    <Package className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Inspection and Re-offers</h2>
                  <p className="text-muted-foreground mb-4">
                    Once we receive your device, our expert technicians inspect it within 1 business day. If everything matches your description, you get the original offer.
                  </p>
                  
                  <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 mb-4">
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm mb-1">Condition Matches</p>
                        <p className="text-xs text-muted-foreground">
                          If the device condition matches your description, we immediately approve the original offer amount.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm mb-1">Condition Mismatch</p>
                        <p className="text-xs text-muted-foreground mb-2">
                          If we find any discrepancies, we'll send you a revised offer with a detailed explanation.
                        </p>
                        <ul className="text-xs space-y-1 text-muted-foreground">
                          <li>• You have 3 days to accept or decline</li>
                          <li>• Decline? We ship your device back for free</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </div>
                <Card className="p-8 backdrop-blur-md bg-card/50 border-border/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Package className="w-8 h-8 text-primary" />
                    </div>
                    <p className="font-semibold">Device Received</p>
                    <p className="text-sm text-muted-foreground">Inspection in progress</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 group">
                      <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
                      <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">Physical condition check</span>
                    </div>
                    <div className="flex items-center gap-3 group">
                      <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" style={{ animationDelay: '200ms' }}></div>
                      <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">Functionality testing</span>
                    </div>
                    <div className="flex items-center gap-3 group">
                      <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" style={{ animationDelay: '400ms' }}></div>
                      <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">IMEI/blacklist verification</span>
                    </div>
                    <div className="flex items-center gap-3 group">
                      <div className="w-2 h-2 rounded-full bg-border"></div>
                      <span className="text-sm text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">Final approval</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Step 4 */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="md:order-2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white flex items-center justify-center font-bold text-xl">
                      4
                    </div>
                    <DollarSign className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Get Paid Fast</h2>
                  <p className="text-muted-foreground mb-4">
                    Once you accept the offer, we process your payment immediately. Choose your preferred payout method and receive your money fast.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span><strong>PayPal:</strong> Same day payout (within 24 hours)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span><strong>Bank Transfer:</strong> 1-3 business days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span><strong>Check:</strong> Mailed within 2 business days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span><strong>Gift Card:</strong> Instant delivery via email</span>
                    </li>
                  </ul>
                </div>
                <Card className="p-8 backdrop-blur-md bg-green-50 dark:bg-green-950/20 border-2 border-green-500 md:order-1 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-green-600">
                  <div className="text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4 animate-pulse" />
                    <h3 className="text-xl font-bold mb-2">Payment Sent!</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Your payout has been processed
                    </p>
                    <div className="p-4 bg-background/80 rounded-md border border-border/50 hover:border-green-500/30 transition-colors">
                      <p className="text-sm text-muted-foreground mb-1">Amount</p>
                      <p className="text-3xl font-bold text-green-600">$445.00</p>
                    </div>
                    <div className="mt-4 p-3 bg-background/80 rounded-md text-left border border-border/50 hover:border-green-500/30 transition-colors">
                      <p className="text-xs text-muted-foreground">Method</p>
                      <p className="text-sm font-medium">PayPal - user@email.com</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-background relative overflow-hidden">
          <div className="container px-4 md:px-6 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg mb-8 text-muted-foreground">
              Get your instant quote in less than 2 minutes
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" data-testid="button-cta-start-quote">
              <Link href="/sell">
                Start Your Quote
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
