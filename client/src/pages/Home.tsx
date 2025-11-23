import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeviceCard } from "@/components/DeviceCard";
import { Link } from "wouter";
import { Search, Lock, Package, DollarSign, Shield, TrendingUp, FileCheck, Zap, Star } from "lucide-react";

export default function Home() {
  const popularDevices = [
    { name: "iPhone 15 Pro", slug: "iphone-15-pro", brand: "Apple", maxPrice: "$510" },
    { name: "iPhone 14 Pro", slug: "iphone-14-pro", brand: "Apple", maxPrice: "$445" },
    { name: "Samsung Galaxy S23", slug: "galaxy-s23", brand: "Samsung", maxPrice: "$385" },
    { name: "iPad Pro 11\"", slug: "ipad-pro-11", brand: "Apple", maxPrice: "$420" },
  ];

  const testimonials = [
    { quote: "Got $450 for my iPhone 14! The process was incredibly smooth and I received payment within 3 days.", name: "Sarah M.", device: "iPhone 14 Pro" },
    { quote: "Best buyback service I've used. Fair pricing and they actually honored the quote after inspection.", name: "Michael R.", device: "Galaxy S22" },
    { quote: "Free shipping label and fast payout. Couldn't ask for more!", name: "Jessica T.", device: "iPad Air" },
  ];

  const faqs = [
    { question: "How long does the process take?", answer: "Most customers receive payment within 3-5 business days after we receive the device." },
    { question: "What if my device condition doesn't match?", answer: "We'll send you a revised offer that you can accept or decline. If you decline, we'll ship your device back for free." },
    { question: "Is my data safe?", answer: "We provide detailed guides on how to wipe your device. Once received, we perform additional data erasure to ensure complete security." },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                  Sell Your Device. Get Paid Fast.
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                  SecondHandCell gives you instant quotes, free shipping, and honest inspections for phones, tablets, watches, and more.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="w-full sm:w-auto" data-testid="button-hero-get-offer">
                    <Link href="/sell">
                      Get an Instant Offer
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-hero-track">
                    <Link href="/track">
                      Track My Order
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <Card className="p-8 bg-background">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center text-4xl">
                      📱
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">iPhone 15 Pro</h3>
                      <p className="text-sm text-muted-foreground">256GB, Unlocked</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Your device is worth</p>
                    <p className="text-4xl font-bold text-primary">$510</p>
                    <p className="text-xs text-muted-foreground mt-2">Offer valid for 14 days</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Four simple steps to turn your old device into cash
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">1</div>
                <h3 className="font-semibold mb-2">Tell us what you're selling</h3>
                <p className="text-sm text-muted-foreground">
                  Choose device, carrier, storage, and condition
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">2</div>
                <h3 className="font-semibold mb-2">Lock in your offer</h3>
                <p className="text-sm text-muted-foreground">
                  Instant quote, guaranteed for 14 days
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">3</div>
                <h3 className="font-semibold mb-2">Ship it for free</h3>
                <p className="text-sm text-muted-foreground">
                  Download label or request a mail-in kit
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">4</div>
                <h3 className="font-semibold mb-2">We inspect and pay you</h3>
                <p className="text-sm text-muted-foreground">
                  Same day decisions once delivered
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why SecondHandCell */}
        <section className="py-16 md:py-24 bg-muted/40">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why SecondHandCell</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <Shield className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Honest, transparent pricing</h3>
                <p className="text-sm text-muted-foreground">
                  No surprise fees or hidden charges. What you see is what you get.
                </p>
              </Card>

              <Card className="p-6">
                <TrendingUp className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Real-time market offers</h3>
                <p className="text-sm text-muted-foreground">
                  Our prices adjust based on current demand and device condition.
                </p>
              </Card>

              <Card className="p-6">
                <FileCheck className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Data protection first</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive guides and secure data wiping processes.
                </p>
              </Card>

              <Card className="p-6">
                <Zap className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Fast payouts</h3>
                <p className="text-sm text-muted-foreground">
                  PayPal or bank transfer within 24 hours of acceptance.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Popular Devices */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Popular Devices</h2>
                <p className="text-muted-foreground">Get instant quotes for the most popular models</p>
              </div>
              <Button asChild variant="outline" data-testid="button-view-all-devices">
                <Link href="/sell">
                  View All
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {popularDevices.map((device) => (
                <DeviceCard key={device.slug} {...device} />
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24 bg-muted/40">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, idx) => (
                <Card key={idx} className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">Sold {testimonial.device}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Teaser */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              </div>

              <div className="space-y-4 mb-8">
                {faqs.map((faq, idx) => (
                  <Card key={idx} className="p-6">
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Button asChild variant="outline" data-testid="button-view-all-faqs">
                  <Link href="/faq">
                    View All FAQs
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to sell your device?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Get your instant quote in less than 2 minutes
            </p>
            <Button asChild size="lg" variant="secondary" data-testid="button-cta-get-started">
              <Link href="/sell">
                Get Started Now
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
