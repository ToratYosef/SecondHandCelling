import { Link } from "wouter";
import { ShieldAlert, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

function AdminDisabled() {
  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-sm border border-border p-8 text-center space-y-6">
        <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <ShieldAlert className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Admin portal disabled</h1>
          <p className="text-muted-foreground">
            The administrative interface is currently unavailable. API endpoints and routes
            remain active for integration and monitoring purposes.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link href="/">Return home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/support" className="inline-flex items-center gap-2">
              <Home className="h-4 w-4" aria-hidden="true" />
              Contact support
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AdminDisabled;
