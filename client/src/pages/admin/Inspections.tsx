import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminProtected } from "@/components/AdminProtected";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type SellOrderWithItems = {
  id: string;
  orderNumber: string;
  status: string;
  totalOriginalOffer: string;
  createdAt: string;
  items: Array<{
    id: string;
    deviceModel: { name: string } | null;
    deviceVariant: { storageSizeGb: number | null } | null;
    inspectedConditionProfileId: string | null;
    finalOfferAmount: string | null;
  }>;
};

export default function AdminInspections() {
  const { data: orders, isLoading } = useQuery<SellOrderWithItems[]>({
    queryKey: ['/api/admin/orders'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const pendingInspection = orders?.filter(o => o.status === 'in_transit') || [];

  return (
    <AdminProtected>
      <div className="flex min-h-screen">
        <AdminSidebar />
        
        <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Inspections</h1>
            <p className="text-muted-foreground">Inspect devices and finalize offers</p>
          </div>

          {isLoading ? (
            <Card>
              <div className="p-8 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </Card>
          ) : pendingInspection.length > 0 ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Date Received</TableHead>
                    <TableHead>Original Offer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInspection.map((order) => {
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
                        <TableCell className="font-semibold">
                          ${parseFloat(order.totalOriginalOffer).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status as any} />
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="default" 
                            size="sm" 
                            data-testid={`button-inspect-${order.orderNumber}`}
                          >
                            Start Inspection
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
              <p className="text-muted-foreground">No devices pending inspection</p>
            </Card>
          )}
        </div>
      </main>
    </div>
    </AdminProtected>
  );
}

