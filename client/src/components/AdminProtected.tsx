import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminProtectedProps {
  children: ReactNode;
}

export function AdminProtected({ children }: AdminProtectedProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState("admin@secondhandcell.com");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(getApiUrl("/api/auth/me"), {
          credentials: "include",
        });

        if (!response.ok) {
          setIsAdmin(false);
          return;
        }

        const user = await response.json();
        if (user.role === "admin" || user.role === "super_admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      }
    };

    checkAuth();
  }, []);

  if (isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const handleInlineLogin = async () => {
    try {
      setSigningIn(true);
      const res = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 401) {
        toast({ title: "Invalid credentials", variant: "destructive" });
        return;
      }
      if (!res.ok) {
        const msg = await res.text();
        toast({ title: "Login failed", description: msg || res.statusText, variant: "destructive" });
        return;
      }

      // Re-check admin status via /api/auth/me
      const me = await fetch(getApiUrl("/api/auth/me"), { credentials: "include" });
      if (!me.ok) {
        toast({ title: "Session check failed", variant: "destructive" });
        return;
      }
      const data = await me.json();
      const role = data?.user?.role || data?.role;
      if (role === "admin" || role === "super_admin") {
        setIsAdmin(true);
        toast({ title: "Signed in", description: `Welcome ${data?.user?.email || email}` });
      } else {
        toast({ title: "Admin access required", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Login error", description: e?.message, variant: "destructive" });
    } finally {
      setSigningIn(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
        <Card className="max-w-md w-full p-8">
          <div className="text-center">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
            <p className="text-muted-foreground mb-6">
              Sign in below to continue without leaving this page.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@secondhandcell.com"
              />
            </div>
            <div>
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setLocation("/")} className="flex-1">
                Go Home
              </Button>
              <Button onClick={handleInlineLogin} className="flex-1" disabled={signingIn}>
                {signingIn ? "Signing In..." : "Sign In"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
