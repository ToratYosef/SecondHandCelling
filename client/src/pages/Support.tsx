import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Clock, HelpCircle } from "lucide-react";
import { useState } from "react";

export default function Support() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-white animate-in fade-in duration-700">
                Contact Support
              </h1>
              <p className="text-xl text-white/60">
                Have a question? We're here to help. Reach out and we'll get back to you as soon as possible.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Contact Info */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                  <p className="text-muted-foreground mb-6">
                    Our support team is available Monday through Friday, 9 AM to 6 PM EST. We typically respond within 24 hours.
                  </p>
                </div>

                <Card className="p-6 backdrop-blur-md bg-card/50 border-border/50 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-600/20 dark:to-cyan-600/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email Support</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Send us an email anytime
                      </p>
                      <a href="mailto:support@secondhandcell.com" className="text-primary hover:underline text-sm font-medium">
                        support@secondhandcell.com
                      </a>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 backdrop-blur-md bg-card/50 border-border/50 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-600/20 dark:to-cyan-600/20 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Response Time</h3>
                      <p className="text-sm text-muted-foreground">
                        We aim to respond to all inquiries within 24 hours during business days.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 backdrop-blur-md bg-card/50 border-border/50 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-600/20 dark:to-cyan-600/20 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">FAQ</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Find instant answers to common questions
                      </p>
                      <a href="/faq" className="text-primary hover:underline text-sm font-medium">
                        Browse FAQ →
                      </a>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Contact Form */}
              <div>
                {submitted ? (
                  <Card className="p-8 text-center backdrop-blur-md bg-green-50 dark:bg-green-950/20 border-green-500">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground mb-6">
                      Thank you for contacting us. We'll get back to you within 24 hours.
                    </p>
                    <Button onClick={() => setSubmitted(false)} variant="outline" data-testid="button-send-another">
                      Send Another Message
                    </Button>
                  </Card>
                ) : (
                  <Card className="p-8 backdrop-blur-md bg-card/50 border-border/50">
                    <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input 
                          id="name" 
                          required 
                          placeholder="Your name"
                          data-testid="input-name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          required 
                          placeholder="your@email.com"
                          data-testid="input-email"
                        />
                      </div>

                      <div>
                        <Label htmlFor="orderNumber">Order or Quote Number (Optional)</Label>
                        <Input 
                          id="orderNumber" 
                          placeholder="SHC-S-000123 or SHC-Q-000456"
                          data-testid="input-order-number"
                        />
                      </div>

                      <div>
                        <Label htmlFor="subject">Subject *</Label>
                        <Input 
                          id="subject" 
                          required 
                          placeholder="How can we help?"
                          data-testid="input-subject"
                        />
                      </div>

                      <div>
                        <Label htmlFor="message">Message *</Label>
                        <Textarea 
                          id="message" 
                          required 
                          rows={5}
                          placeholder="Please provide as much detail as possible..."
                          data-testid="input-message"
                        />
                      </div>

                      <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700" data-testid="button-submit-support">
                        Send Message
                      </Button>
                    </form>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
