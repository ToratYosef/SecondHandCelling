import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeviceCard } from "@/components/DeviceCard";
import { Link } from "wouter";
import { Search, Lock, Package, DollarSign, Shield, TrendingUp, FileCheck, Zap, Star, Smartphone, Clock, CheckCircle, ArrowRight, MapPin, Users, TrendingUpIcon } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Home() {
  // Scroll animation setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    document.querySelectorAll('.scroll-animate').forEach((el) => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);
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
        {/* Premium Hero Section */}
        <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          {/* Premium Background Elements */}
          <div className="absolute inset-0">
            {/* Dark luxury gradient mesh */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
            
            {/* Soft glow orbs */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[90vh] py-12">
              
              {/* Left Column - Main Content */}
              <div className="space-y-8">
                {/* Hero Badge */}
                <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                  <span className="text-sm font-semibold text-white/90 tracking-wide uppercase">Instant Phone Buyback</span>
                </div>

                {/* Main Headline */}
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight animate-in fade-in duration-700">
                    Sell Your Phone With{" "}
                    <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      Total Confidence
                    </span>
                  </h1>
                  <p className="text-2xl md:text-3xl font-semibold text-white/70">
                    Fast Quotes. Highest Payouts. Zero Hassle.
                  </p>
                </div>

                {/* Supporting Text */}
                <p className="text-lg text-white/60 leading-relaxed max-w-xl">
                  Secure, transparent, and lightning-fast device buyback. Thousands of users trust us for honest pricing, free shipping, and same-day processing on most devices.
                </p>

                {/* Primary CTA */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button asChild size="lg" className="text-lg px-8 py-7 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 border-0">
                    <Link href="/sell">
                      Get My Instant Quote
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </div>

                {/* Micro-Trust Line */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-white/50 pt-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-400" />
                    <span>Free shipping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span>Secure processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span>No hidden fees</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Glass Card */}
              <div className="relative lg:block hidden">
                {/* Phone Hero Image with Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-full blur-[100px] animate-pulse"></div>
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Smartphone className="w-48 h-48 text-white/10" strokeWidth={0.5} />
                  </div>
                </div>

                {/* Premium Glass Card */}
                <div className="relative backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-2xl">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Premium Buyback Extras</h3>
                      <p className="text-white/60 text-sm">
                        Every device sale includes added perks to keep your trade-in smooth and stress-free.
                      </p>
                    </div>

                    {/* Benefit Rows */}
                    <div className="space-y-4 pt-4">
                      <div className="flex items-start gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <Package className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">Free Prepaid Shipping Label</p>
                          <p className="text-white/50 text-sm">Included</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <DollarSign className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">Same-Day Payout Option</p>
                          <p className="text-white/50 text-sm">Available Nationwide</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <Lock className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">FMI / Account Lock Support</p>
                          <p className="text-white/50 text-sm">Free Assistance</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <Smartphone className="w-6 h-6 text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">All Major Carriers & Models</p>
                          <p className="text-white/50 text-sm">Accepted</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Stats Row */}
            <div className="border-t border-white/10 pt-12 pb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-blue-400" />
                    <p className="text-xs uppercase tracking-wider text-white/40 font-semibold">Devices Purchased</p>
                  </div>
                  <p className="text-3xl font-bold text-white">100K+</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-green-400" />
                    <p className="text-xs uppercase tracking-wider text-white/40 font-semibold">Approval Rate</p>
                  </div>
                  <p className="text-3xl font-bold text-white">92%</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                    <p className="text-xs uppercase tracking-wider text-white/40 font-semibold">Average Payout</p>
                  </div>
                  <p className="text-3xl font-bold text-white">$320</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-orange-400" />
                    <p className="text-xs uppercase tracking-wider text-white/40 font-semibold">Nationwide Shipping</p>
                  </div>
                  <p className="text-3xl font-bold text-white">30K+ ZIPs</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12 scroll-animate accordion-reveal">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Four simple steps to turn your old device into cash
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="scroll-animate slide-up stagger-1 text-center backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-6 hover:bg-card/70 hover:border-primary/30 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Search className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">1</div>
                <h3 className="font-semibold mb-2">Tell us what you're selling</h3>
                <p className="text-sm text-muted-foreground">
                  Choose device, carrier, storage, and condition
                </p>
              </div>

              <div className="scroll-animate slide-up stagger-2 text-center backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-6 hover:bg-card/70 hover:border-primary/30 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Lock className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">2</div>
                <h3 className="font-semibold mb-2">Lock in your offer</h3>
                <p className="text-sm text-muted-foreground">
                  Instant quote, guaranteed for 14 days
                </p>
              </div>

              <div className="scroll-animate slide-up stagger-3 text-center backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-6 hover:bg-card/70 hover:border-primary/30 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">3</div>
                <h3 className="font-semibold mb-2">Ship it for free</h3>
                <p className="text-sm text-muted-foreground">
                  Download label or request a mail-in kit
                </p>
              </div>

              <div className="scroll-animate slide-up stagger-4 text-center backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-6 hover:bg-card/70 hover:border-primary/30 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">4</div>
                <h3 className="font-semibold mb-2">We inspect and pay you</h3>
                <p className="text-sm text-muted-foreground">
                  Same day decisions once delivered
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why SecondHandCell */}
        <section className="py-16 md:py-24 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12 scroll-animate bounce-in">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why SecondHandCell</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="scroll-animate flip-in stagger-1 backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-6 hover:bg-card/70 hover:border-primary/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Honest, transparent pricing</h3>
                <p className="text-sm text-muted-foreground">
                  No surprise fees or hidden charges. What you see is what you get.
                </p>
              </div>

              <div className="scroll-animate flip-in stagger-2 backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-6 hover:bg-card/70 hover:border-primary/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Real-time market offers</h3>
                <p className="text-sm text-muted-foreground">
                  Our prices adjust based on current demand and device condition.
                </p>
              </div>

              <div className="scroll-animate flip-in stagger-3 backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-6 hover:bg-card/70 hover:border-primary/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileCheck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Data protection first</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive guides and secure data wiping processes.
                </p>
              </div>

              <div className="scroll-animate flip-in stagger-4 backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-6 hover:bg-card/70 hover:border-primary/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Fast payouts</h3>
                <p className="text-sm text-muted-foreground">
                  PayPal or bank transfer within 24 hours of acceptance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Device Types We Buy */}
        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12 scroll-animate accordion-reveal">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">We Buy All Types of Devices</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From smartphones to tablets, we accept a wide range of devices
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="scroll-animate scale-in stagger-1 backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-6 text-center hover:bg-card/70 hover:border-primary/30 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Smartphone className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Smartphones</h3>
                <p className="text-xs text-muted-foreground">iPhone, Samsung, Google</p>
              </div>

              <div className="scroll-animate scale-in stagger-2 backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-6 text-center hover:bg-card/70 hover:border-primary/30 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="4" y="2" width="16" height="20" rx="2" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-1">Tablets</h3>
                <p className="text-xs text-muted-foreground">iPad, Galaxy Tab</p>
              </div>

              <div className="scroll-animate scale-in stagger-3 backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-6 text-center hover:bg-card/70 hover:border-primary/30 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <circle cx="12" cy="12" r="6" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-1">Smartwatches</h3>
                <p className="text-xs text-muted-foreground">Apple Watch, Galaxy Watch</p>
              </div>

              <div className="scroll-animate scale-in stagger-4 backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-6 text-center hover:bg-card/70 hover:border-primary/30 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2" />
                    <path d="M8 21h8" strokeWidth="2" strokeLinecap="round" />
                    <path d="M12 17v4" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-1">Laptops</h3>
                <p className="text-xs text-muted-foreground">MacBook, Chromebook</p>
              </div>

              <div className="scroll-animate scale-in stagger-5 backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-6 text-center hover:bg-card/70 hover:border-primary/30 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 18V5l12-2v13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="6" cy="18" r="3" strokeWidth="2" />
                    <circle cx="18" cy="16" r="3" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-1">Audio</h3>
                <p className="text-xs text-muted-foreground">AirPods, Galaxy Buds</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12 scroll-animate rotate-in">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, idx) => (
                <div key={idx} className={`scroll-animate slide-up stagger-${idx + 1} backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-6 hover:bg-card/70 hover:border-primary/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2`}>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">Sold {testimonial.device}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Payment Methods & Trust Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="scroll-animate slide-left">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Paid Your Way</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Choose from multiple payment methods for fast, secure payouts
                </p>
                
                <div className="space-y-4">
                  <div className="scroll-animate slide-right stagger-1 flex items-center gap-4 backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-4 hover:bg-card/70 hover:border-primary/30 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-semibold">PayPal</p>
                      <p className="text-xs text-muted-foreground">Instant transfer available</p>
                    </div>
                  </div>
                  
                  <div className="scroll-animate slide-right stagger-2 flex items-center gap-4 backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-4 hover:bg-card/70 hover:border-primary/30 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">Venmo</p>
                      <p className="text-xs text-muted-foreground">Fast mobile payments</p>
                    </div>
                  </div>
                  
                  <div className="scroll-animate slide-right stagger-3 flex items-center gap-4 backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-4 hover:bg-card/70 hover:border-primary/30 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">Bank Transfer</p>
                      <p className="text-xs text-muted-foreground">Direct deposit to your account</p>
                    </div>
                  </div>
                  
                  <div className="scroll-animate slide-right stagger-4 flex items-center gap-4 backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-4 hover:bg-card/70 hover:border-primary/30 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-semibold">Zelle</p>
                      <p className="text-xs text-muted-foreground">Same-day bank transfer</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="scroll-animate slide-right">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted & Secure</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Your data and payment are protected with industry-leading security
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="scroll-animate scale-in stagger-1 backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-6 text-center hover:bg-card/70 hover:border-primary/30 hover:shadow-xl transition-all duration-500">
                    <Shield className="w-10 h-10 text-primary mx-auto mb-3" />
                    <p className="font-semibold text-sm">SSL Encrypted</p>
                    <p className="text-xs text-muted-foreground mt-1">Bank-level security</p>
                  </div>
                  
                  <div className="scroll-animate scale-in stagger-2 backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-6 text-center hover:bg-card/70 hover:border-primary/30 hover:shadow-xl transition-all duration-500">
                    <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                    <p className="font-semibold text-sm">BBB Accredited</p>
                    <p className="text-xs text-muted-foreground mt-1">A+ Rating</p>
                  </div>
                  
                  <div className="scroll-animate scale-in stagger-3 backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-6 text-center hover:bg-card/70 hover:border-primary/30 hover:shadow-xl transition-all duration-500">
                    <FileCheck className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                    <p className="font-semibold text-sm">Data Wiping</p>
                    <p className="text-xs text-muted-foreground mt-1">Certified erasure</p>
                  </div>
                  
                  <div className="scroll-animate scale-in stagger-4 backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-6 text-center hover:bg-card/70 hover:border-primary/30 hover:shadow-xl transition-all duration-500">
                    <Star className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                    <p className="font-semibold text-sm">5-Star Reviews</p>
                    <p className="text-xs text-muted-foreground mt-1">10K+ happy customers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 md:px-6 text-center scroll-animate accordion-reveal">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to sell your device?
            </h2>
            <p className="text-lg mb-8 text-muted-foreground">
              Get your instant quote in less than 2 minutes
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" data-testid="button-cta-get-started">
              <Link href="/sell">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
