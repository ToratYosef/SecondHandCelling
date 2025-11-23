import { CustomerSidebar } from "@/components/CustomerSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

type SellOrderWithItems = {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  totalOriginalOffer: string;
  totalFinalOffer: string | null;
  payoutStatus: string;
  currency: string;
  createdAt: string;
  items: Array<{
    id: string;
    deviceModel: { name: string } | null;
    deviceVariant: { storageSizeGb: number | null } | null;
    originalOfferAmount: string;
    finalOfferAmount: string | null;
  }>;
};

export default function AccountOrders() {
  const { data: orders, isLoading } = useQuery<SellOrderWithItems[]>({
    queryKey: ['/api/orders/my-orders'],
  });

  return (
    <div className="flex min-h-screen">
      <CustomerSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Orders</h1>
              <p className="text-muted-foreground">Track and manage your sell orders</p>
            </div>
            <Button asChild data-testid="button-sell-device">
              <Link href="/sell">
                Sell Another Device
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <Card>
              <div className="p-8 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </Card>
          ) : orders && orders.length > 0 ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Original Offer</TableHead>
                    <TableHead>Final Offer</TableHead>
                    <TableHead>Payout</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const deviceName = order.items[0]?.deviceModel?.name || "Unknown Device";
                    const storageSize = order.items[0]?.deviceVariant?.storageSizeGb;
                    const deviceLabel = storageSize 
                      ? `${deviceName} ${storageSize}GB` 
                      : deviceName;
                    
                    return (
                      <TableRow key={order.orderNumber} className="hover-elevate">
                        <TableCell className="font-mono text-sm" data-testid={`text-order-${order.orderNumber}`}>
                          {order.orderNumber}
                        </TableCell>
                        <TableCell className="font-medium">{deviceLabel}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status as any} />
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${parseFloat(order.totalOriginalOffer).toFixed(2)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {order.totalFinalOffer ? (
                            <span className={
                              parseFloat(order.totalFinalOffer) < parseFloat(order.totalOriginalOffer) 
                                ? "text-amber-600" 
                                : "text-green-600"
                            }>
                              ${parseFloat(order.totalFinalOffer).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.payoutStatus as any} />
                        </TableCell>
                        <TableCell>
                          <Button asChild variant="ghost" size="sm" data-testid={`button-view-${order.orderNumber}`}>
                            <Link href={`/account/orders/${order.orderNumber}`}>
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <div className="text-muted-foreground mb-4">
                <p className="text-lg">No orders yet</p>
                <p className="text-sm">Start selling your devices to see orders here</p>
              </div>
              <Button asChild data-testid="button-get-started">
                <Link href="/sell">
                  Get Started
                </Link>
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
