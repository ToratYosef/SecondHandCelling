import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Public Pages
import Home from "@/pages/Home";
import HowItWorks from "@/pages/HowItWorks";
import FAQ from "@/pages/FAQ";
import DataWipe from "@/pages/DataWipe";
import Support from "@/pages/Support";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Sell from "@/pages/Sell";
import Track from "@/pages/Track";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import QuoteBuilder from "@/pages/QuoteBuilder";

// Customer Pages
import AccountOverview from "@/pages/account/Overview";
import AccountOffers from "@/pages/account/Offers";
import AccountOrders from "@/pages/account/Orders";
import AccountOrderDetail from "@/pages/account/OrderDetail";
import AccountSettings from "@/pages/account/Settings";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminDevices from "@/pages/admin/Devices";
import AdminOrders from "@/pages/admin/Orders";
import AdminInspections from "@/pages/admin/Inspections";
import AdminPricing from "@/pages/admin/Pricing";
import AdminInspectionDetail from "@/pages/admin/InspectionDetail";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public Marketing Pages */}
      <Route path="/" component={Home} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/faq" component={FAQ} />
      <Route path="/data-wipe" component={DataWipe} />
      <Route path="/support" component={Support} />
      <Route path="/legal/terms" component={Terms} />
      <Route path="/legal/privacy" component={Privacy} />
      
      {/* Sell Flow */}
      <Route path="/sell" component={Sell} />
      <Route path="/sell/quote/:slug" component={QuoteBuilder} />
      <Route path="/track" component={Track} />
      
      {/* Auth */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      
      {/* Customer Account */}
      <Route path="/account/overview" component={AccountOverview} />
      <Route path="/account/offers" component={AccountOffers} />
      <Route path="/account/orders" component={AccountOrders} />
      <Route path="/account/orders/:orderNumber" component={AccountOrderDetail} />
      <Route path="/account/settings" component={AccountSettings} />
      
      {/* Admin Portal */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/devices" component={AdminDevices} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/inspections" component={AdminInspections} />
      <Route path="/admin/inspections/:orderNumber" component={AdminInspectionDetail} />
      <Route path="/admin/pricing" component={AdminPricing} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
