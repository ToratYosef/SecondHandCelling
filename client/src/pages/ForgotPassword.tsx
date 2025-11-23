import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { KeyRound } from "lucide-react";
import { useState } from "react";

export default function ForgotPassword() {
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
          <div className="max-w-2xl mx-auto px-4 md:px-6">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <KeyRound className="w-12 h-12 text-primary mx-auto mb-4" />
                <h1 className="text-4xl font-bold mb-2">Reset Password</h1>
                <p className="text-muted-foreground">
                  {submitted 
                    ? "Check your email for reset instructions"
                    : "We'll send you instructions to reset your password"
                  }
                </p>
              </div>

              <Card className="p-8">
                {submitted ? (
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto">
                      <KeyRound className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Email Sent!</h3>
                      <p className="text-sm text-muted-foreground">
                        If an account exists with that email, you'll receive password reset instructions shortly.
                      </p>
                    </div>
                    <div className="pt-4">
                      <Button asChild variant="outline" className="w-full" data-testid="button-back-to-login">
                        <Link href="/login">
                          Back to Login
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email"
                        type="email"
                        required
                        placeholder="your@email.com"
                        data-testid="input-email"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Enter the email associated with your account
                      </p>
                    </div>

                    <Button type="submit" className="w-full" data-testid="button-send-reset">
                      Send Reset Instructions
                    </Button>

                    <div className="text-center pt-4">
                      <Link href="/login">
                        <a className="text-sm text-muted-foreground hover:text-primary" data-testid="link-back-to-login">
                          ← Back to login
                        </a>
                      </Link>
                    </div>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
