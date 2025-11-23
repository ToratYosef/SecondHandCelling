import { CustomerSidebar } from "@/components/CustomerSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Package, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

type SellOrderDetail = {
  id: string;
  orderNumber: string;
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
    claimedConditionProfileId: string;
    claimedIssuesJson: any;
    originalOfferAmount: string;
    inspectedConditionProfileId: string | null;
    inspectionNotes: string | null;
    finalOfferAmount: string | null;
  }>;
};

export default function AccountOrderDetail() {
  const [, params] = useRoute("/account/orders/:orderNumber");
  const orderNumber = params?.orderNumber;

  const { data: order, isLoading } = useQuery<SellOrderDetail>({
    queryKey: ['/api/orders/by-number', orderNumber],
    enabled: !!orderNumber,
  });

  const item = order?.items[0];
  const deviceName = item?.deviceModel?.name || "Unknown Device";
  const storageSize = item?.deviceVariant?.storageSizeGb;
  const deviceLabel = storageSize ? `${deviceName} ${storageSize}GB` : deviceName;

  return (
    <div className="flex min-h-screen">
      <CustomerSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : order ? (
            <>
              <div className="mb-8">
                <Button asChild variant="ghost" size="sm" className="mb-4">
                  <Link href="/account/orders">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Orders
                  </Link>
                </Button>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">Order {order.orderNumber}</h1>
                    <p className="text-muted-foreground">{deviceLabel}</p>
                  </div>
                  <StatusBadge status={order.status as any} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Details</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Order Number</span>
                      <span className="font-mono text-sm">{order.orderNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Created</span>
                      <span className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <StatusBadge status={order.status as any} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Payout Status</span>
                      <StatusBadge status={order.payoutStatus as any} />
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Original Offer</span>
                      <span className="text-xl font-bold text-green-600">
                        ${parseFloat(order.totalOriginalOffer).toFixed(2)}
                      </span>
                    </div>
                    {order.totalFinalOffer && (
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Final Offer</span>
                        <span className={`text-xl font-bold ${
                          parseFloat(order.totalFinalOffer) < parseFloat(order.totalOriginalOffer)
                            ? 'text-amber-600'
                            : 'text-green-600'
                        }`}>
                          ${parseFloat(order.totalFinalOffer).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Device Condition</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Condition you reported when getting your quote
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Financed Device</span>
                      {item?.claimedIssuesJson?.isFinanced ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">No Power</span>
                      {item?.claimedIssuesJson?.noPower ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Functional Issue</span>
                      {item?.claimedIssuesJson?.functionalIssue ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Cracked Glass</span>
                      {item?.claimedIssuesJson?.crackedGlass ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Activation Lock</span>
                      {item?.claimedIssuesJson?.activationLock ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {item?.inspectionNotes && (
                <Card className="p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-2">Inspection Notes</h2>
                  <p className="text-sm text-muted-foreground">{item.inspectionNotes}</p>
                </Card>
              )}

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Need Help?</h3>
                    <p className="text-sm text-muted-foreground">
                      Contact our support team for assistance with your order
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link href="/support">Contact Support</Link>
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Order not found</p>
              <Button asChild className="mt-4">
                <Link href="/account/orders">View All Orders</Link>
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
