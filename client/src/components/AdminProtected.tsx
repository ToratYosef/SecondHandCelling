import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface AdminProtectedProps {
  children: ReactNode;
}

export function AdminProtected({ children }: AdminProtectedProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground mb-6">
            You need to be logged in as an admin to access this page.
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setLocation("/")}
              className="flex-1"
            >
              Go Home
            </Button>
            <Button 
              onClick={() => setLocation("/login")}
              className="flex-1"
            >
              Sign In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
