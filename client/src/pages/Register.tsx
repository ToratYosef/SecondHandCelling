import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useLocation } from "wouter";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Register() {
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phoneNumber = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Parse full name into first and last name
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || nameParts[0] || "";

    // Validate passwords match
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/auth/register", {
        email,
        password,
        firstName,
        lastName,
        phoneNumber: phoneNumber || undefined,
        marketingOptIn,
      });

      toast({
        title: "Account created!",
        description: "Welcome to SecondHandCell. You're now logged in.",
      });

      // Redirect to sell page after successful registration
      setLocation("/sell");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-2xl mx-auto px-4 md:px-6">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <UserPlus className="w-12 h-12 text-primary mx-auto mb-4" />
                <h1 className="text-4xl font-bold mb-2">Create Account</h1>
                <p className="text-muted-foreground">Start selling your devices today</p>
              </div>

              <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input 
                      id="name"
                      name="name"
                      required
                      placeholder="John Doe"
                      data-testid="input-name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="your@email.com"
                      data-testid="input-email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      data-testid="input-phone"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input 
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      placeholder="••••••••"
                      data-testid="input-password"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      At least 8 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input 
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      minLength={8}
                      placeholder="••••••••"
                      data-testid="input-confirm-password"
                    />
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox 
                      id="marketing"
                      checked={marketingOptIn}
                      onCheckedChange={(checked) => setMarketingOptIn(checked as boolean)}
                      data-testid="checkbox-marketing"
                    />
                    <Label htmlFor="marketing" className="text-sm font-normal cursor-pointer">
                      Send me occasional updates about new features and special offers
                    </Label>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    By creating an account, you agree to our{" "}
                    <Link href="/legal/terms">
                      <a className="text-primary hover:underline">Terms of Service</a>
                    </Link>
                    {" "}and{" "}
                    <Link href="/legal/privacy">
                      <a className="text-primary hover:underline">Privacy Policy</a>
                    </Link>
                    .
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-register">
                    {isSubmitting ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login">
                      <a className="text-primary hover:underline font-medium" data-testid="link-login">
                        Sign in
                      </a>
                    </Link>
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
