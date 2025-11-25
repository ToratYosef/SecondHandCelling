import { CustomerSidebar } from "@/components/CustomerSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Package, FileText, DollarSign, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";

type SellOrderWithItems = {
  id: string;
  orderNumber: string;
  status: string;
  totalOriginalOffer: string;
  payoutStatus: string;
  createdAt: string;
  items: Array<{
    deviceModel: { name: string } | null;
    deviceVariant: { storageSizeGb: number | null } | null;
  }>;
};

export default function AccountOverview() {
  const { data: orders, isLoading } = useQuery<SellOrderWithItems[]>({
    queryKey: ['/api/orders'],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/orders'), { credentials: 'include' });
      if (res.status === 401) {
        return [];
      }
      if (!res.ok) throw new Error('Failed to load orders');
      return res.json();
    },
  });

  const recentOrder = orders?.[0];
  const devicesInTransit = orders?.filter(o => o.status === 'in_transit' || o.status === 'awaiting_device').length || 0;
  const completedOrders = orders?.filter(o => o.status === 'completed').length || 0;
  const lastPayout = orders?.find(o => o.payoutStatus === 'paid');
  
  const deviceName = recentOrder?.items[0]?.deviceModel?.name || "Unknown Device";
  const storageSize = recentOrder?.items[0]?.deviceVariant?.storageSizeGb;
  const deviceLabel = storageSize ? `${deviceName} ${storageSize}GB` : deviceName;

  return (
    <div className="flex min-h-screen">
      <CustomerSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
            <p className="text-muted-foreground">Here's what's happening with your devices</p>
          </div>

          {/* Quick Stats */}
          {isLoading ? (
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {[1,2,3,4].map(i => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-24 w-full" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-3xl font-bold mb-1">{orders?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-3xl font-bold mb-1">{devicesInTransit}</div>
                <p className="text-sm text-muted-foreground">Devices in Transit</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-3xl font-bold mb-1">
                  {lastPayout ? `$${parseFloat(lastPayout.totalOriginalOffer).toFixed(2)}` : '$0.00'}
                </div>
                <p className="text-sm text-muted-foreground">Last Payout</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-3xl font-bold mb-1">{completedOrders}</div>
                <p className="text-sm text-muted-foreground">Devices Sold</p>
              </Card>
            </div>
          )}

          {/* Latest Order */}
          <div className="grid md:grid-cols-2 gap-6">
            {isLoading ? (
              <Card className="p-6">
                <Skeleton className="h-48 w-full" />
              </Card>
            ) : recentOrder ? (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Your Latest Order</h2>
                  <Button asChild variant="ghost" size="sm" data-testid="button-view-all-orders">
                    <Link href="/account/orders">
                      View All
                    </Link>
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Order Number</span>
                      <span className="font-mono text-sm">{recentOrder.orderNumber}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Device</span>
                      <span className="text-sm font-medium">{deviceLabel}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <StatusBadge status={recentOrder.status as any} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Amount</span>
                      <span className="text-lg font-bold text-primary">
                        ${parseFloat(recentOrder.totalOriginalOffer).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button asChild className="w-full" data-testid="button-view-order-details">
                    <Link href={`/account/orders/${recentOrder.orderNumber}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">No Orders Yet</h2>
                <p className="text-muted-foreground mb-4">Start selling your devices to see orders here</p>
                <Button asChild className="w-full">
                  <Link href="/sell">Get Started</Link>
                </Button>
              </Card>
            )}

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start" data-testid="button-sell-another">
                  <Link href="/sell">
                    <Package className="w-4 h-4 mr-3" />
                    Sell Another Device
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start" data-testid="button-view-offers">
                  <Link href="/account/offers">
                    <FileText className="w-4 h-4 mr-3" />
                    View My Offers
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start" data-testid="button-contact-support">
                  <Link href="/account/support">
                    <FileText className="w-4 h-4 mr-3" />
                    Contact Support
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
