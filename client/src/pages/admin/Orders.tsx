import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminProtected } from "@/components/AdminProtected";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { getApiUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus?: string;
  total: number;
  currency: string;
  createdAt: string;
  notesCustomer?: string | null;
  notesInternal?: string | null;
  customerEmail?: string;
  customerName?: string;
  companyName?: string;
  shipments?: Array<{
    id: string;
    carrier?: string | null;
    serviceLevel?: string | null;
    trackingNumber?: string | null;
    labelUrl?: string | null;
    status?: string | null;
  }>;
}

const statusOptions = [
  "label_pending",
  "awaiting_device",
  "in_transit",
  "received",
  "under_inspection",
  "reoffer_sent",
  "payout_pending",
  "completed",
  "cancelled",
  "returned_to_customer",
];

export default function AdminOrders() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [reofferAmount, setReofferAmount] = useState("");
  const [reofferMessage, setReofferMessage] = useState("");
  const [reofferEmail, setReofferEmail] = useState("");

  const { data: orders = [], isLoading, refetch, isFetching } = useQuery<AdminOrder[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/admin/orders"), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load orders");
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ orderId, status, paymentStatus }: { orderId: string; status?: string; paymentStatus?: string }) => {
      const res = await fetch(getApiUrl(`/api/admin/orders/${orderId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, paymentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Order updated" });
      refetch();
    },
    onError: (error: any) => toast({ title: "Update failed", description: error?.message, variant: "destructive" }),
  });

  const sendReoffer = useMutation({
    mutationFn: async ({ orderId, amount, message, email }: { orderId: string; amount: string; message: string; email?: string }) => {
      const res = await fetch(getApiUrl(`/api/admin/orders/${orderId}/reoffer`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount, message, email }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Reoffer emailed" });
      refetch();
    },
    onError: (error: any) => toast({ title: "Email failed", description: error?.message || "Unable to send reoffer", variant: "destructive" }),
  });

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (!search) return true;
      const query = search.toLowerCase();
      return (
        (order.orderNumber || "").toLowerCase().includes(query) ||
        (order.customerEmail || "").toLowerCase().includes(query) ||
        (order.customerName || "").toLowerCase().includes(query)
      );
    });
  }, [orders, search, statusFilter]);

  useEffect(() => {
    if (selectedOrder) {
      setReofferAmount("");
      setReofferMessage("");
      setReofferEmail(selectedOrder.customerEmail || "");
    }
  }, [selectedOrder]);

  return (
    <AdminProtected>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold">Orders</h1>
                <p className="text-muted-foreground">View, fulfill, and send reoffers without leaving the dashboard.</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <div className="space-y-1">
                  <Label className="text-xs">Search</Label>
                  <Input
                    placeholder="Order # or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-56"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                  {isFetching ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
            </div>

            <Card className="p-4">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading orders…</div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No orders match your filters.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/40">
                        <TableCell className="font-mono">{order.orderNumber}</TableCell>
                        <TableCell><StatusBadge status={order.status} /></TableCell>
                        <TableCell className="capitalize text-sm text-muted-foreground">{order.paymentStatus || "pending"}</TableCell>
                        <TableCell className="font-semibold">
                          {order.currency} {Number(order.total).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{order.customerName || "Customer"}</div>
                          <div className="text-xs text-muted-foreground">{order.customerEmail || "—"}</div>
                        </TableCell>
                        <TableCell>{format(new Date(order.createdAt), "PPpp")}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>
        </main>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl">Order Details {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Customer Info Section - Blue */}
              <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-blue-900">Customer: {selectedOrder.customerName || "Guest"}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Email:</span> {selectedOrder.customerEmail || "—"}</div>
                    <div><span className="font-medium">Phone:</span> —</div>
                  </div>
                </div>
              </Card>

              {/* Order Items Section - Purple */}
              <Card className="border-l-4 border-l-purple-500 bg-purple-50/50">
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-purple-900">Items</h3>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="space-y-2">
                      {selectedOrder.items.map((item: any) => (
                        <div key={item.id} className="text-sm grid grid-cols-4 gap-2">
                          <div><span className="font-medium">Item:</span> {item.deviceVariantId}</div>
                          <div><span className="font-medium">Storage:</span> —</div>
                          <div><span className="font-medium">Carrier:</span> —</div>
                          <div><span className="font-medium">Qty:</span> {item.quantity}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No items found</div>
                  )}
                  <div className="pt-2 border-t">
                    <div className="text-sm"><span className="font-medium">Estimated Payout:</span> {selectedOrder.currency} {Number(selectedOrder.total).toFixed(2)}</div>
                    <div className="text-sm"><span className="font-medium">Payment Method:</span> Check</div>
                  </div>
                </div>
              </Card>

              {/* Shipping Section - Green */}
              <Card className="border-l-4 border-l-green-500 bg-green-50/50">
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-green-900">Shipping Address</h3>
                  <div className="text-sm text-muted-foreground">Address details not available</div>
                  <Button size="sm" variant="outline" className="mt-2">Edit</Button>
                </div>
              </Card>

              {/* IMEI Check Section - Amber */}
              <Card className="border-l-4 border-l-amber-500 bg-amber-50/50">
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-amber-900">IMEI Check</h3>
                  <div className="text-sm">
                    <div><span className="font-medium">Status:</span> <StatusBadge status={selectedOrder.status} /></div>
                    <div className="text-muted-foreground">No device record found for this order.</div>
                  </div>
                </div>
              </Card>

              {/* Conditions Section - Cyan */}
              <Card className="border-l-4 border-l-cyan-500 bg-cyan-50/50">
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-cyan-900">Conditions</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Powers On:</span> Yes</div>
                    <div><span className="font-medium">Fully Functional:</span> No</div>
                    <div><span className="font-medium">No Cracks:</span> N/A</div>
                    <div><span className="font-medium">Cosmetic:</span> N/A</div>
                  </div>
                </div>
              </Card>

              {/* Status Section - Slate */}
              <Card className="border-l-4 border-l-slate-500 bg-slate-50/50">
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-slate-900">Current Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={selectedOrder.status} />
                      <Select
                        value={selectedOrder.status}
                        onValueChange={(value) => updateStatus.mutate({ orderId: selectedOrder.id, status: value })}
                      >
                        <SelectTrigger className="w-56">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="text-sm">
                      <div><span className="font-medium">Order Age:</span> {Math.round((new Date().getTime() - new Date(selectedOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24) * 10) / 10} days old</div>
                      <div><span className="font-medium">Last Reminder:</span> Never</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Shipping Label Section - Indigo */}
              <Card className="border-l-4 border-l-indigo-500 bg-indigo-50/50">
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-indigo-900">Shipping Label Tracking</h3>
                  {selectedOrder.shipments && selectedOrder.shipments.length > 0 ? (
                    <div className="space-y-2">
                      {selectedOrder.shipments.map((shipment) => (
                        <div key={shipment.id} className="text-sm">
                          <div><span className="font-medium">Tracking:</span> {shipment.trackingNumber || "—"}</div>
                          {shipment.labelUrl && (
                            <a
                              href={shipment.labelUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:underline"
                            >
                              View Label ({shipment.trackingNumber})
                            </a>
                          )}
                          <div className="mt-2 text-muted-foreground">Label tracking available. Refresh to see the latest scans.</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No tracking information</div>
                  )}
                </div>
              </Card>

              {/* Actions Section - Multi-color buttons */}
              <Card className="border-l-4 border-l-rose-500 bg-rose-50/50">
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-rose-900">Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Send Reminder Email</Button>
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700">Send Expiration Reminder</Button>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Print Document</Button>
                    <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">Print Packing Slip</Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus.mutate({ orderId: selectedOrder.id, status: "received" })}>Mark as Received</Button>
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Finalize 75% Reduced Payout</Button>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Refresh Email Label Tracking</Button>
                    <Button size="sm" className="bg-slate-600 hover:bg-slate-700">Void Shipping Labels</Button>
                    <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">Clear Saved Shipping Data</Button>
                    <Button size="sm" variant="destructive" onClick={() => updateStatus.mutate({ orderId: selectedOrder.id, status: "cancelled" })}>Cancel Order & Void Labels</Button>
                    <Button size="sm" variant="destructive" className="bg-red-700 hover:bg-red-800">Delete Order</Button>
                  </div>
                </div>
              </Card>

              {/* Reoffer Section */}
              <Card className="p-4 space-y-4">
                <div>
                  <h3 className="font-semibold">Send Reoffer Email</h3>
                  <p className="text-sm text-muted-foreground">Send an updated offer to the customer</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={reofferAmount}
                      onChange={(e) => setReofferAmount(e.target.value)}
                      placeholder="200.00"
                    />
                  </div>
                  <div>
                    <Label>Send to</Label>
                    <Input
                      type="email"
                      value={reofferEmail}
                      onChange={(e) => setReofferEmail(e.target.value)}
                      placeholder={selectedOrder.customerEmail || "customer@example.com"}
                    />
                  </div>
                </div>
                <div>
                  <Label>Message</Label>
                  <Input
                    value={reofferMessage}
                    onChange={(e) => setReofferMessage(e.target.value)}
                    placeholder="Add inspection notes or next steps"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() =>
                      sendReoffer.mutate({
                        orderId: selectedOrder.id,
                        amount: reofferAmount,
                        message: reofferMessage,
                        email: reofferEmail || undefined,
                      })
                    }
                    disabled={sendReoffer.isPending || !reofferAmount}
                  >
                    {sendReoffer.isPending ? "Sending…" : "Send reoffer"}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminProtected>
  );
}
