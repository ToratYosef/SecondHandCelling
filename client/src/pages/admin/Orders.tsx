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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage order {selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>Update status, send reoffers, and view fulfillment information.</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current status</p>
                      <StatusBadge status={selectedOrder.status} />
                    </div>
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

                  <div className="flex flex-wrap gap-2">
                    {["awaiting_device", "in_transit", "received", "under_inspection", "payout_pending", "completed"].map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant="secondary"
                        onClick={() => updateStatus.mutate({ orderId: selectedOrder.id, status })}
                      >
                        Mark {status.replace(/_/g, " ")}
                      </Button>
                    ))}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateStatus.mutate({ orderId: selectedOrder.id, status: "cancelled" })}
                    >
                      Cancel order
                    </Button>
                  </div>
                </Card>

                <Card className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Payment status</p>
                      <div className="font-semibold capitalize">{selectedOrder.paymentStatus || "pending"}</div>
                    </div>
                    <Select
                      value={selectedOrder.paymentStatus || "pending"}
                      onValueChange={(value) => updateStatus.mutate({ orderId: selectedOrder.id, paymentStatus: value })}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Card>

                <Card className="p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold">Reoffer email</h3>
                    <p className="text-sm text-muted-foreground">Send an updated offer via Nodemailer without leaving the page.</p>
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
                        placeholder="customer@example.com"
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

              <div className="space-y-4">
                <Card className="p-4 space-y-2">
                  <h3 className="font-semibold">Customer</h3>
                  <p className="text-sm">{selectedOrder.customerName || "Unknown customer"}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customerEmail || "No email on file"}</p>
                  <p className="text-sm text-muted-foreground">Company: {selectedOrder.companyName || "Guest Orders"}</p>
                  <p className="text-sm text-muted-foreground">Total: {selectedOrder.currency} {Number(selectedOrder.total).toFixed(2)}</p>
                </Card>

                <Card className="p-4 space-y-3">
                  <h3 className="font-semibold">Shipments</h3>
                  {selectedOrder.shipments && selectedOrder.shipments.length > 0 ? (
                    <div className="space-y-2">
                      {selectedOrder.shipments.map((shipment) => (
                        <div key={shipment.id} className="rounded border p-2 text-sm">
                          <div className="font-medium">{shipment.carrier || "Carrier"} {shipment.serviceLevel}</div>
                          <div className="text-muted-foreground">Tracking: {shipment.trackingNumber || "—"}</div>
                          {shipment.labelUrl && (
                            <a
                              href={shipment.labelUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary text-xs"
                            >
                              Download label
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No shipments yet.</p>
                  )}
                </Card>

                <Card className="p-4 space-y-2">
                  <h3 className="font-semibold">Notes</h3>
                  <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {selectedOrder.notesInternal || selectedOrder.notesCustomer || "No notes yet."}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminProtected>
  );
}
