import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ToastProvider } from "@/components/AdminToast";

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
import Success from "@/pages/Success";
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

// Admin Pages (disabled view)
import AdminDisabled from "@/pages/admin/Disabled";

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
      <Route path="/success" component={Success} />
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
      <Route path="/admin/dashboard" component={AdminDisabled} />
      <Route path="/admin/dashboard-old" component={AdminDisabled} />
      <Route path="/admin/aging" component={AdminDisabled} />
      <Route path="/admin/analytics" component={AdminDisabled} />
      <Route path="/admin/print-queue" component={AdminDisabled} />
      <Route path="/admin/clicks" component={AdminDisabled} />
      <Route path="/admin/email" component={AdminDisabled} />
      <Route path="/admin/devices" component={AdminDisabled} />
      <Route path="/admin/orders" component={AdminDisabled} />
      <Route path="/admin/inspections" component={AdminDisabled} />
      <Route path="/admin/inspections/:orderNumber" component={AdminDisabled} />
      <Route path="/admin/pricing" component={AdminDisabled} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <TooltipProvider>
          <ScrollToTop />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
