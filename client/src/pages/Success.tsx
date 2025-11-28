import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Download, Package } from "lucide-react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getApiUrl } from "@/lib/api";

export default function Success() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  
  // Always call all hooks first, before any conditional logic
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const searchParams = new URLSearchParams(searchString || "");
  const orderNumber = searchParams.get('order');

  // Fetch order details to get shipment info
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['/api/orders/by-number', orderNumber],
    queryFn: async () => {
      if (!orderNumber) throw new Error('No order number');
      const res = await fetch(getApiUrl(`/api/orders/by-number/${orderNumber}`));
      if (!res.ok) throw new Error('Failed to fetch order');
      return res.json();
    },
    enabled: !!orderNumber,
    retry: false,
  });

  // Now handle conditional rendering after all hooks
  if (!orderNumber) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="p-8 text-center max-w-md">
            <p className="text-muted-foreground mb-4">No order found</p>
            <Button onClick={() => setLocation('/')}>Return Home</Button>
          </Card>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="p-8 text-center max-w-md">
            <p className="text-muted-foreground mb-4">Order not found</p>
            <Button onClick={() => setLocation('/')}>Return Home</Button>
          </Card>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const firstItem = order.items?.[0];
  const deviceName = firstItem?.deviceModel?.name || 'Your device';
  const storageRaw = firstItem?.deviceVariant?.storageGb ?? firstItem?.deviceVariant?.storage;
  const storage = storageRaw ? String(storageRaw) : '';
  const offerAmount = typeof order.totalOriginalOffer === 'number' ? order.totalOriginalOffer : (typeof order.total === 'number' ? order.total : 0);
  const shipment = order.shipments?.[0] || null;

  // Debug logging
  console.log('[Success] Order:', order?.id);
  console.log('[Success] Shipment:', shipment);
  console.log('[Success] Label URL:', shipment?.labelUrl);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      <main className="flex-1 py-12 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-3xl mx-auto px-4 md:px-6 relative z-10">
          <Card className="p-8 md:p-12 backdrop-blur-md bg-card/50 border-border/50 hover:shadow-2xl transition-all duration-500">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
                <Check className="w-12 h-12 text-green-600 animate-pulse" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Order Confirmed!</h1>
              <p className="text-lg text-muted-foreground">
                Your order has been submitted successfully
              </p>
            </div>

            {/* Order Summary */}
            <div className="backdrop-blur-md bg-muted/40 border border-border/50 rounded-lg p-6 mb-8 hover:border-primary/30 transition-colors">
              <h2 className="font-semibold text-lg mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Number:</span>
                  <span className="font-mono font-semibold">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Device:</span>
                  <span className="font-medium">
                    {deviceName} {storage ? `(${storage}GB)` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Offer Amount:</span>
                  <span className="font-bold text-primary text-xl">
                    ${offerAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Label Section */}
            {shipment && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Your Shipping Label is Ready!</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download and print your prepaid shipping label to send us your device.
                    </p>
                    
                    {shipment.trackingNumber && (
                      <div className="bg-white/80 dark:bg-gray-900/80 rounded-md p-3 mb-4">
                        <p className="text-xs text-muted-foreground mb-1">Tracking Number</p>
                        <p className="font-mono font-semibold">{shipment.trackingNumber}</p>
                      </div>
                    )}
                    
                    {shipment.labelUrl && (
                      <Button
                        onClick={() => window.open(shipment.labelUrl, '_blank')}
                        className="w-full sm:w-auto"
                        size="lg"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Shipping Label
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* What's Next */}
            <div className="border-t pt-8">
              <h3 className="font-semibold text-lg mb-4">What Happens Next?</h3>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Print Your Label</p>
                    <p className="text-sm text-muted-foreground">
                      Download and print the shipping label above. A copy has also been sent to your email.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Pack Your Device</p>
                    <p className="text-sm text-muted-foreground">
                      Securely pack your device in a box with adequate padding. Attach the label to the outside.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Ship It</p>
                    <p className="text-sm text-muted-foreground">
                      Drop off your package at any USPS location or schedule a pickup.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Get Paid</p>
                    <p className="text-sm text-muted-foreground">
                      We'll inspect your device within 24-48 hours and send your payment immediately upon approval.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button
                variant="outline"
                onClick={() => setLocation(`/track?order=${orderNumber}`)}
                className="flex-1"
              >
                Track Order Status
              </Button>
              <Button
                onClick={() => setLocation('/')}
                className="flex-1"
              >
                Return to Home
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
