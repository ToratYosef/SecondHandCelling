import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminProtected } from "@/components/AdminProtected";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
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
  }>;
};

export default function AdminOrders() {
    // Orders Dashboard state
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable');
    const [sortBy, setSortBy] = useState<'createdAt' | 'orderNumber'>('createdAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

  const { data: orders, isLoading } = useQuery<SellOrderWithItems[]>({
    queryKey: ['/api/admin/orders'],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  const [selectedOrder, setSelectedOrder] = useState<SellOrderWithItems | null>(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <AdminProtected>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">All Orders</h1>
                <p className="text-muted-foreground">View and manage sell orders</p>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Search by customer, order #, email, phone..."
                  className="border rounded px-3 py-2 text-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ minWidth: 220 }}
                />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="border rounded px-2 py-2 text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="label_pending">Label Pending</option>
                  <option value="awaiting_device">Awaiting Device</option>
                  <option value="in_transit">In Transit</option>
                  <option value="received">Received</option>
                  <option value="under_inspection">Under Inspection</option>
                  <option value="reoffer_pending">Reoffer Pending</option>
                  <option value="customer_decision_pending">Customer Decision Pending</option>
                  <option value="payout_pending">Payout Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned_to_customer">Returned</option>
                </select>
                <select
                  value={density}
                  onChange={e => setDensity(e.target.value as any)}
                  className="border rounded px-2 py-2 text-sm"
                >
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </select>
                <select
                  value={pageSize}
                  onChange={e => setPageSize(Number(e.target.value))}
                  className="border rounded px-2 py-2 text-sm"
                >
                  {[10, 20, 50, 100].map(size => (
                    <option key={size} value={size}>{size} / page</option>
                  ))}
                </select>
              </div>
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
                {/* Bulk actions */}
                <div className="flex gap-2 mb-2">
                  <Button
                    variant="outline"
                    disabled={selectedIds.length === 0}
                    onClick={async () => {
                      // Bulk status update example
                      const newStatus = prompt("Set status for selected orders:", "completed");
                      if (newStatus) {
                        await Promise.all(selectedIds.map(id => fetch(`/api/admin/orders/${id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: newStatus }),
                        })));
                        alert("Bulk status updated!");
                        setSelectedIds([]);
                      }
                    }}
                  >Bulk Status Update</Button>
                  <Button
                    variant="outline"
                    disabled={selectedIds.length === 0}
                    onClick={() => alert("Bulk tracking refresh (placeholder)")}
                  >Bulk Tracking Refresh</Button>
                </div>
                <Table className={density === 'compact' ? 'text-xs' : ''}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <input
                          type="checkbox"
                          checked={selectedIds.length === pagedOrders.length && pagedOrders.length > 0}
                          onChange={e => setSelectedIds(e.target.checked ? pagedOrders.map(o => o.id) : [])}
                        />
                      </TableHead>
                      <TableHead onClick={() => { setSortBy('orderNumber'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }} className="cursor-pointer">Order #</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Original Offer</TableHead>
                      <TableHead>Final Offer</TableHead>
                      <TableHead>Payout</TableHead>
                      <TableHead onClick={() => { setSortBy('createdAt'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }} className="cursor-pointer">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedOrders.map((order) => (
                      <TableRow key={order.id} className={`cursor-pointer hover:bg-muted/40 ${selectedIds.includes(order.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`} onClick={() => { setSelectedOrder(order); setShowModal(true); }}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(order.id)}
                            onChange={e => {
                              if (e.target.checked) setSelectedIds([...selectedIds, order.id]);
                              else setSelectedIds(selectedIds.filter(id => id !== order.id));
                            }}
                            onClick={e => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell className="font-mono">{order.orderNumber || order.order_number}</TableCell>
                        <TableCell><StatusBadge status={order.status} /></TableCell>
                        <TableCell>{order.userId || order.user_id}</TableCell>
                        <TableCell>
                          {order.items && order.items.length > 0 ? (
                            <ul className="list-disc ml-4">
                              {order.items.map((item) => (
                                <li key={item.id}>
                                  {item.deviceModel?.name || item.device_model?.name || 'Unknown Model'}
                                  {item.deviceVariant?.storageGb ? ` (${item.deviceVariant.storageGb}GB)` : item.device_variant?.storageGb ? ` (${item.device_variant.storageGb}GB)` : ''}
                                </li>
                              ))}
                            </ul>
                          ) : '—'}
                        </TableCell>
                        <TableCell>${order.totalOriginalOffer || order.total_original_offer || '—'}</TableCell>
                        <TableCell>{order.totalFinalOffer || order.total_final_offer || '—'}</TableCell>
                        <TableCell>{order.payoutStatus || order.payout_status || '—'}</TableCell>
                        <TableCell>{order.createdAt || order.created_at}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                  <div>
                    Page {page} of {Math.ceil(filteredOrders.length / pageSize)}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
                    <Button variant="outline" disabled={page * pageSize >= filteredOrders.length} onClick={() => setPage(page + 1)}>Next</Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No orders found</p>
              </Card>
            )}
              // Filtering, sorting, and pagination logic
              const filteredOrders = (orders || [])
                .filter(order => {
                  if (statusFilter !== "all" && order.status !== statusFilter) return false;
                  if (!search) return true;
                  const searchLower = search.toLowerCase();
                  return (
                    (order.orderNumber || order.order_number || "").toLowerCase().includes(searchLower) ||
                    (order.userId || order.user_id || "").toLowerCase().includes(searchLower)
                    // Add more fields as needed (email, phone, etc.)
                  );
                });
              const sortedOrders = [...filteredOrders].sort((a, b) => {
                if (sortBy === 'createdAt') {
                  const aDate = new Date(a.createdAt || a.created_at).getTime();
                  const bDate = new Date(b.createdAt || b.created_at).getTime();
                  return sortDir === 'asc' ? aDate - bDate : bDate - aDate;
                } else {
                  const aNum = (a.orderNumber || a.order_number || "");
                  const bNum = (b.orderNumber || b.order_number || "");
                  return sortDir === 'asc' ? aNum.localeCompare(bNum) : bNum.localeCompare(aNum);
                }
              });
              const pagedOrders = sortedOrders.slice((page - 1) * pageSize, page * pageSize);
            {/* Order Details Modal */}
            {showModal && selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg max-w-2xl w-full p-8 relative">
                  <button className="absolute top-4 right-4 text-xl" onClick={() => setShowModal(false)}>&times;</button>
                  <h2 className="text-2xl font-bold mb-4">Order Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div><strong>Order #:</strong> {selectedOrder.orderNumber || selectedOrder.order_number}</div>
                      <div><strong>Status:</strong> <StatusBadge status={selectedOrder.status} /></div>
                      <div><strong>Customer:</strong> {selectedOrder.userId || selectedOrder.user_id || '—'}</div>
                      <div><strong>Original Offer:</strong> ${selectedOrder.totalOriginalOffer || selectedOrder.total_original_offer || '—'}</div>
                      <div><strong>Final Offer:</strong> {selectedOrder.totalFinalOffer || selectedOrder.total_final_offer || '—'}</div>
                      <div><strong>Payout Status:</strong> {selectedOrder.payoutStatus || selectedOrder.payout_status || '—'}</div>
                      <div><strong>Created:</strong> {selectedOrder.createdAt || selectedOrder.created_at}</div>
                      <div><strong>Items:</strong>
                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                          <ul className="list-disc ml-4">
                            {selectedOrder.items.map((item) => (
                              <li key={item.id}>
                                {item.deviceModel?.name || item.device_model?.name || 'Unknown Model'}
                                {item.deviceVariant?.storageGb ? ` (${item.deviceVariant.storageGb}GB)` : item.device_variant?.storageGb ? ` (${item.device_variant.storageGb}GB)` : ''}
                              </li>
                            ))}
                          </ul>
                        ) : '—'}
                      </div>
                      <div className="mt-4">
                        <label className="block font-semibold mb-1">Update Status</label>
                        <select
                          className="border rounded px-2 py-1 w-full"
                          value={selectedOrder.status}
                          onChange={async e => {
                            const newStatus = e.target.value;
                            await fetch(`/api/admin/orders/${selectedOrder.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: newStatus }),
                            });
                            alert("Order status updated!");
                            setShowModal(false);
                          }}
                        >
                          <option value="label_pending">Label Pending</option>
                          <option value="awaiting_device">Awaiting Device</option>
                          <option value="in_transit">In Transit</option>
                          <option value="received">Received</option>
                          <option value="under_inspection">Under Inspection</option>
                          <option value="reoffer_pending">Reoffer Pending</option>
                          <option value="customer_decision_pending">Customer Decision Pending</option>
                          <option value="payout_pending">Payout Pending</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="returned_to_customer">Returned</option>
                        </select>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button variant="destructive" onClick={async () => {
                          if (confirm("Delete this order permanently?")) {
                            await fetch(`/api/admin/orders/${selectedOrder.id}`, { method: "DELETE" });
                            alert("Order deleted.");
                            setShowModal(false);
                          }
                        }}>Delete Order</Button>
                        <Button variant="outline" onClick={async () => {
                          if (confirm("Cancel this order?")) {
                            await fetch(`/api/admin/orders/${selectedOrder.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: "cancelled" }),
                            });
                            alert("Order cancelled.");
                            setShowModal(false);
                          }
                        }}>Cancel Order</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="font-semibold mb-2">Order Timeline & Activity Log</div>
                      <div className="bg-muted/40 rounded p-2 text-xs">(Timeline/activity log placeholder)</div>
                      <div className="font-semibold mt-4 mb-2">Send Email to Customer</div>
                      <Button variant="outline" onClick={() => alert('Send reminder email (placeholder)')}>Send Reminder</Button>
                      <Button variant="outline" onClick={() => alert('Send expiration warning (placeholder)')}>Send Expiration Warning</Button>
                      <Button variant="outline" onClick={() => alert('Send kit follow-up (placeholder)')}>Send Kit Follow-up</Button>
                      <Button variant="outline" onClick={() => alert('Send device condition email (placeholder)')}>Send Device Condition Email</Button>
                      <div className="font-semibold mt-4 mb-2">Reoffer System</div>
                      <Button variant="outline" onClick={() => alert('Propose reoffer (placeholder)')}>Propose Reoffer</Button>
                      <div className="font-semibold mt-4 mb-2">Label Generation</div>
                      <Button variant="primary" onClick={async () => {
                        const res = await fetch(`/api/admin/orders/${selectedOrder.id}/shipment`, { method: "POST" });
                        if (res.ok) {
                          const shipment = await res.json();
                          alert(`Label generated!\nDownload: ${shipment.labelUrl}`);
                        } else {
                          alert("Failed to generate label.");
                        }
                      }}>Generate Shipping Label</Button>
                      <Button variant="outline" onClick={async () => {
                        const res = await fetch(`/api/admin/orders/${selectedOrder.id}/shipment`, { method: "GET" });
                        if (res.ok) {
                          const shipment = await res.json();
                          if (shipment.labelUrl) {
                            window.open(shipment.labelUrl, "_blank");
                          } else {
                            alert("No label found.");
                          }
                        } else {
                          alert("Failed to fetch label.");
                        }
                      }}>View/Download Label</Button>
                      <Button variant="outline" onClick={async () => {
                        if (confirm("Void this shipping label?")) {
                          const res = await fetch(`/api/admin/orders/${selectedOrder.id}/shipment/void`, { method: "POST" });
                          if (res.ok) {
                            alert("Label voided.");
                          } else {
                            alert("Failed to void label.");
                          }
                        }
                      }}>Void Label</Button>
                      <Button variant="outline" onClick={async () => {
                        const res = await fetch(`/api/admin/orders/${selectedOrder.id}/shipment/refresh`, { method: "POST" });
                        if (res.ok) {
                          const data = await res.json();
                          alert(`Tracking status: ${data.status}`);
                        } else {
                          alert("Failed to refresh tracking.");
                        }
                      }}>Refresh Tracking</Button>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" onClick={() => setShowModal(false)}>Close</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminProtected>
  );
}
