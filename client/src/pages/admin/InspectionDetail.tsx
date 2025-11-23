import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminProtected } from "@/components/AdminProtected";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { getQueryFn } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

type SellOrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  totalOriginalOffer: string;
  payoutStatus: string;
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
    basePrice: string | null;
    totalPenalty: string | null;
    penaltyBreakdownJson: any;
  }>;
};

export default function AdminInspectionDetail() {
  const [, params] = useRoute("/admin/inspections/:orderNumber");
  const orderNumber = params?.orderNumber;

  const { data: order, isLoading } = useQuery<SellOrderDetail>({
    queryKey: ['/api/orders/by-number', orderNumber],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!orderNumber,
  });

  const item = order?.items[0];
  const deviceName = item?.deviceModel?.name || "Unknown Device";
  const storageSize = item?.deviceVariant?.storageSizeGb;
  const deviceLabel = storageSize ? `${deviceName} ${storageSize}GB` : deviceName;

  return (
    <AdminProtected>
      <div className="flex min-h-screen">
        <AdminSidebar />
        
        <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          ) : order ? (
            <>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">Inspection: {order.orderNumber}</h1>
                    <p className="text-muted-foreground">{deviceLabel}</p>
                  </div>
                  <StatusBadge status={order.status as any} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Customer Claimed Condition</h2>
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
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Original Offer</span>
                      <span className="text-xl font-bold text-green-600">
                        ${item?.originalOfferAmount ? parseFloat(item.originalOfferAmount).toFixed(2) : '0.00'}
                      </span>
                    </div>
                    {item?.basePrice && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Base Price</span>
                          <span>${parseFloat(item.basePrice).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-red-600">
                          <span>Total Penalties</span>
                          <span>-${item.totalPenalty ? parseFloat(item.totalPenalty).toFixed(2) : '0.00'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Inspection Results</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="condition">Inspected Condition</Label>
                      <Select>
                        <SelectTrigger id="condition">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>Confirmed Issues</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="inspect-financed" />
                        <label htmlFor="inspect-financed" className="text-sm">Device is financed</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="inspect-power" />
                        <label htmlFor="inspect-power" className="text-sm">Device has no power</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="inspect-functional" />
                        <label htmlFor="inspect-functional" className="text-sm">Functional issues present</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="inspect-glass" />
                        <label htmlFor="inspect-glass" className="text-sm">Glass is cracked</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="inspect-lock" />
                        <label htmlFor="inspect-lock" className="text-sm">Activation lock enabled</label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Inspection Notes</Label>
                      <Textarea 
                        id="notes" 
                        placeholder="Enter inspection findings..."
                        className="min-h-24"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Inspection Actions</h3>
                    <p className="text-sm text-muted-foreground">
                      Review the inspection results and proceed with the appropriate action
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" data-testid="button-return-device">
                      Return Device
                    </Button>
                    <Button variant="secondary" data-testid="button-create-reoffer">
                      Create Re-offer
                    </Button>
                    <Button data-testid="button-approve-payout">
                      Approve for Payout
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Order not found</p>
            </Card>
          )}
        </div>
      </main>
    </div>
    </AdminProtected>
  );
}
