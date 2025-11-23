import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  CreditCard, 
  MapPin, 
  MessageSquare,
  Settings,
  LogOut,
  Smartphone
} from "lucide-react";

export function CustomerSidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/account/overview", label: "Overview", icon: LayoutDashboard },
    { href: "/account/offers", label: "My Offers", icon: FileText },
    { href: "/account/orders", label: "Orders", icon: Package },
    { href: "/account/payout-methods", label: "Payout Methods", icon: CreditCard },
    { href: "/account/addresses", label: "Addresses", icon: MapPin },
    { href: "/account/support", label: "Support", icon: MessageSquare },
    { href: "/account/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-64 border-r bg-muted/40 min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <Link href="/">
          <a className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1">
            <Smartphone className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">SecondHandCell</span>
          </a>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <a>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" data-testid="button-logout">
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
