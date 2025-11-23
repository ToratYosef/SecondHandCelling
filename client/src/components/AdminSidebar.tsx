import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Smartphone,
  FileText,
  Package,
  DollarSign,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  BarChart3,
  CheckSquare
} from "lucide-react";

export function AdminSidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/devices", label: "Devices", icon: Smartphone },
    { href: "/admin/pricing", label: "Pricing", icon: DollarSign },
    { href: "/admin/orders", label: "Orders", icon: Package },
    { href: "/admin/inspections", label: "Inspections", icon: CheckSquare },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-64 border-r bg-sidebar min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1">
          <Smartphone className="h-6 w-6 text-primary" />
          <div>
            <div className="text-xl font-bold">SecondHandCell</div>
            <div className="text-xs text-muted-foreground">Admin Portal</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Button
              key={item.href}
              asChild
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start"
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Link href={item.href}>
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Button asChild variant="ghost" className="w-full justify-start mb-2">
          <Link href="/">
            ← Back to Site
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" data-testid="button-logout">
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
