import { useState } from "react";
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

  // Filtering, sorting, and pagination logic
  const filteredOrders = (orders || [])
    .filter(order => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        (order.orderNumber || "").toLowerCase().includes(searchLower) ||
        (order.userId || "").toLowerCase().includes(searchLower)
      );
    });
  
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'createdAt') {
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return sortDir === 'asc' ? aDate - bDate : bDate - aDate;
    } else {
      const aNum = a.orderNumber || "";
      const bNum = b.orderNumber || "";
      return sortDir === 'asc' ? aNum.localeCompare(bNum) : bNum.localeCompare(aNum);
    }
  });
  
  const pagedOrders = sortedOrders.slice((page - 1) * pageSize, page * pageSize);

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
                        <TableCell className="font-mono">{order.orderNumber}</TableCell>
                        <TableCell><StatusBadge status={order.status} /></TableCell>
                        <TableCell>{order.userId}</TableCell>
                        <TableCell>
                          {order.items && order.items.length > 0 ? (
                            <ul className="list-disc ml-4">
                              {order.items.map((item) => (
                                <li key={item.id}>
                                  {item.deviceModel?.name || 'Unknown Model'}
                                  {item.deviceVariant?.storageSizeGb ? ` (${item.deviceVariant.storageSizeGb}GB)` : ''}
                                </li>
                              ))}
                            </ul>
                          ) : '—'}
                        </TableCell>
                        <TableCell>${order.totalOriginalOffer || '—'}</TableCell>
                        <TableCell>{order.totalFinalOffer || '—'}</TableCell>
                        <TableCell>{order.payoutStatus || '—'}</TableCell>
                        <TableCell>{order.createdAt}</TableCell>
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
            
            {/* Order Details Modal */}
            {showModal && selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  {/* Header */}
                  <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">Order Details</h2>
                      <p className="text-blue-100 text-sm">{selectedOrder.orderNumber}</p>
                    </div>
                    <button 
                      className="text-white hover:bg-white/20 rounded-full p-2 transition-colors" 
                      onClick={() => setShowModal(false)}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-6">
                    {/* Order Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">STATUS</div>
                        <StatusBadge status={selectedOrder.status} />
                      </div>
                      <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <div className="text-xs text-green-600 dark:text-green-400 font-semibold mb-1">ORIGINAL OFFER</div>
                        <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                          ${selectedOrder.totalOriginalOffer || '0.00'}
                        </div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                        <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1">PAYOUT STATUS</div>
                        <div className="text-lg font-semibold capitalize text-purple-700 dark:text-purple-300">
                          {(selectedOrder.payoutStatus || 'not_started').replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    {/* Order Details Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Customer Info
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Customer ID:</span>
                              <span className="font-medium">{selectedOrder.userId || 'Guest'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Created:</span>
                              <span className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                            </div>
                            {selectedOrder.totalFinalOffer && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Final Offer:</span>
                                <span className="font-bold text-green-600">${selectedOrder.totalFinalOffer}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Devices
                          </h3>
                          {selectedOrder.items && selectedOrder.items.length > 0 ? (
                            <ul className="space-y-2">
                              {selectedOrder.items.map((item) => (
                                <li key={item.id} className="flex items-center gap-2 text-sm bg-white dark:bg-gray-900 p-2 rounded border">
                                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                  <span className="font-medium">{item.deviceModel?.name || 'Unknown Model'}</span>
                                  {item.deviceVariant?.storageSizeGb && (
                                    <span className="text-muted-foreground">({item.deviceVariant.storageSizeGb}GB)</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">No items</p>
                          )}
                        </div>
                      </div>

                      {/* Actions Section */}
                      <div className="space-y-4">
                        {/* Status Update */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                          <label className="block font-semibold text-sm mb-2 text-blue-600 dark:text-blue-400">Update Status</label>
                          <select
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            <option value="label_pending">📦 Label Pending</option>
                            <option value="awaiting_device">⏳ Awaiting Device</option>
                            <option value="in_transit">🚚 In Transit</option>
                            <option value="received">✅ Received</option>
                            <option value="under_inspection">🔍 Under Inspection</option>
                            <option value="reoffer_pending">💰 Reoffer Pending</option>
                            <option value="customer_decision_pending">⏱️ Customer Decision Pending</option>
                            <option value="payout_pending">💳 Payout Pending</option>
                            <option value="completed">🎉 Completed</option>
                            <option value="cancelled">❌ Cancelled</option>
                            <option value="returned_to_customer">↩️ Returned</option>
                          </select>
                        </div>

                        {/* Shipping Actions - Only show for relevant statuses */}
                        {['label_pending', 'awaiting_device', 'in_transit'].includes(selectedOrder.status) && (
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                            <h3 className="font-semibold text-sm mb-3 text-blue-700 dark:text-blue-300">📦 Shipping Label</h3>
                            <div className="space-y-2">
                              {selectedOrder.status === 'label_pending' && (
                                <Button 
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                  onClick={async () => {
                                    const res = await fetch(`/api/admin/orders/${selectedOrder.id}/shipment`, { method: "POST" });
                                    if (res.ok) {
                                      const shipment = await res.json();
                                      alert(`Label generated!\nTracking: ${shipment.trackingNumber}`);
                                      window.open(shipment.labelUrl, "_blank");
                                    } else {
                                      alert("Failed to generate label.");
                                    }
                                  }}
                                >
                                  Generate Shipping Label
                                </Button>
                              )}
                              {selectedOrder.status !== 'label_pending' && (
                                <>
                                  <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={async () => {
                                      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/shipment`);
                                      if (res.ok) {
                                        const shipment = await res.json();
                                        if (shipment.labelUrl) window.open(shipment.labelUrl, "_blank");
                                        else alert("No label found.");
                                      }
                                    }}
                                  >
                                    📄 View/Download Label
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={async () => {
                                      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/shipment/refresh`, { method: "POST" });
                                      if (res.ok) {
                                        const data = await res.json();
                                        alert(`Tracking status: ${data.status}`);
                                      }
                                    }}
                                  >
                                    🔄 Refresh Tracking
                                  </Button>
                                  {selectedOrder.status === 'awaiting_device' && (
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      className="w-full"
                                      onClick={async () => {
                                        if (confirm("Void this shipping label?")) {
                                          const res = await fetch(`/api/admin/orders/${selectedOrder.id}/shipment/void`, { method: "POST" });
                                          if (res.ok) alert("Label voided.");
                                        }
                                      }}
                                    >
                                      Void Label
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Inspection Actions - Only for inspection statuses */}
                        {['under_inspection', 'reoffer_pending'].includes(selectedOrder.status) && (
                          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                            <h3 className="font-semibold text-sm mb-3 text-amber-700 dark:text-amber-300">🔍 Inspection</h3>
                            <Button 
                              variant="outline" 
                              className="w-full border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/20"
                              onClick={() => alert('Propose reoffer (placeholder)')}
                            >
                              💰 Propose Reoffer
                            </Button>
                          </div>
                        )}

                        {/* Danger Zone */}
                        <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 border border-red-200 dark:border-red-800">
                          <h3 className="font-semibold text-sm mb-3 text-red-700 dark:text-red-300">⚠️ Danger Zone</h3>
                          <div className="space-y-2">
                            {selectedOrder.status !== 'cancelled' && (
                              <Button 
                                variant="outline" 
                                className="w-full border-red-300 text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                                onClick={async () => {
                                  if (confirm("Cancel this order?")) {
                                    await fetch(`/api/admin/orders/${selectedOrder.id}`, {
                                      method: "PATCH",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ status: "cancelled" }),
                                    });
                                    alert("Order cancelled.");
                                    setShowModal(false);
                                  }
                                }}
                              >
                                Cancel Order
                              </Button>
                            )}
                            <Button 
                              variant="destructive" 
                              className="w-full"
                              onClick={async () => {
                                if (confirm("Delete this order permanently? This cannot be undone!")) {
                                  await fetch(`/api/admin/orders/${selectedOrder.id}`, { method: "DELETE" });
                                  alert("Order deleted.");
                                  setShowModal(false);
                                }
                              }}
                            >
                              🗑️ Delete Order
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end pt-4 border-t">
                      <Button variant="outline" onClick={() => setShowModal(false)}>Close</Button>
                    </div>
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
