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
      
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                How It Works
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Selling your device to SecondHandCell is simple, safe, and fast. Here's our complete process from quote to payout.
              </p>
            </div>
          </div>
        </section>

        {/* Main Steps */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto space-y-16">
              {/* Step 1 */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
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
                <Card className="p-8 bg-muted/40">
                  <div className="space-y-4">
                    <div className="p-4 bg-background rounded-md border">
                      <p className="text-sm font-medium mb-1">Device</p>
                      <p className="text-lg font-semibold">iPhone 14 Pro, 256GB</p>
                    </div>
                    <div className="p-4 bg-background rounded-md border">
                      <p className="text-sm font-medium mb-1">Condition</p>
                      <p className="text-lg font-semibold">Good</p>
                    </div>
                    <div className="p-4 bg-primary text-primary-foreground rounded-md">
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
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
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
                <Card className="p-8 bg-muted/40 md:order-1">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-background rounded-md border">
                      <span className="font-medium">Print Label</span>
                      <span className="text-sm text-green-600 font-semibold">FREE</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background rounded-md border">
                      <span className="font-medium">Mail-in Kit</span>
                      <span className="text-sm text-green-600 font-semibold">FREE</span>
                    </div>
                    <div className="p-4 bg-background rounded-md border">
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
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
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
                <Card className="p-8 bg-muted/40">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-primary" />
                    </div>
                    <p className="font-semibold">Device Received</p>
                    <p className="text-sm text-muted-foreground">Inspection in progress</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Physical condition check</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Functionality testing</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">IMEI/blacklist verification</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-muted"></div>
                      <span className="text-sm text-muted-foreground">Final approval</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Step 4 */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="md:order-2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                      4
                    </div>
                    <DollarSign className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Get Paid</h2>
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
                <Card className="p-8 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 md:order-1">
                  <div className="text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Payment Sent!</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Your payout has been processed
                    </p>
                    <div className="p-4 bg-background rounded-md">
                      <p className="text-sm text-muted-foreground mb-1">Amount</p>
                      <p className="text-3xl font-bold text-green-600">$445.00</p>
                    </div>
                    <div className="mt-4 p-3 bg-background rounded-md text-left">
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
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Get your instant quote in less than 2 minutes
            </p>
            <Button asChild size="lg" variant="secondary" data-testid="button-cta-start-quote">
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
