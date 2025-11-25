import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "../../components/AdminLayout";
import { AdminProtected } from "../../components/AdminProtected";
import { AdminModal } from "../../components/AdminModal";
import { LoadingSpinner, EmptyState, ErrorState } from "../../components/AdminUtilities";
import { useToast } from "../../components/AdminToast";
import { Button } from "../../components/ui/button";
import { StatusBadge } from "../../components/StatusBadge";
import { Card } from "../../components/ui/card";
import { getApiUrl } from "@/lib/api";

interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  customerName?: string;
  customerEmail?: string;
  status: string;
  totalOriginalOffer: string;
  totalFinalOffer: string | null;
  payoutStatus: string;
  createdAt: string;
  updatedAt: string;
  labelStatus?: string;
  trackingNumber?: string;
  items?: any[];
}

export default function AdminDashboardNew() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [detailsModal, setDetailsModal] = useState<string | null>(null);
  const [reofferModal, setReofferModal] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const toast = useToast();
  const queryClient = useQueryClient();

  // Fetch orders with filters
  const { data: ordersData, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-orders", search, statusFilter, dateRange, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (dateRange !== "all") params.set("dateRange", dateRange);
      params.set("page", page.toString());
      params.set("pageSize", pageSize.toString());

      const res = await fetch(getApiUrl(`/api/admin/orders?${params}`), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/admin/dashboard-stats"), {
        credentials: "include",
      });
      if (!res.ok) return {};
      return res.json();
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(getApiUrl(`/api/admin/orders/${id}/status`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Order status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: () => {
      toast.error("Failed to update order status");
    },
  });

  // Generate label mutation
  const generateLabelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(getApiUrl(`/api/admin/orders/${id}/shipment`), {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to generate label");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Shipping label generated successfully");
      if (data.labelUrl) {
        window.open(data.labelUrl, "_blank");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate shipping label");
    },
  });

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(getApiUrl(`/api/admin/orders/${id}`), {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete order");
    },
    onSuccess: () => {
      toast.success("Order deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setDetailsModal(null);
    },
    onError: () => {
      toast.error("Failed to delete order");
    },
  });

  const orders = ordersData?.orders || [];
  const totalOrders = ordersData?.total || 0;

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o: Order) => o.id));
    }
  };

  const handleSelectOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((oid) => oid !== id) : [...prev, id]
    );
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateRange("all");
    setPage(1);
  };

  return (
    <AdminProtected>
      <AdminLayout>
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders Hub</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all customer orders and shipments</p>
            </div>
          </div>

          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-800">
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Total Orders</div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats?.totalOrders || 0}</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-800">
              <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">This Month</div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats?.monthOrders || 0}</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-200 dark:border-amber-800">
              <div className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">Pending</div>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats?.pendingOrders || 0}</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-800">
              <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Need Printing</div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats?.needsPrinting || 0}</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 border-indigo-200 dark:border-indigo-800">
              <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">Received Today</div>
              <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{stats?.receivedToday || 0}</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 border-pink-200 dark:border-pink-800">
              <div className="text-sm font-medium text-pink-600 dark:text-pink-400 mb-1">Avg Order Value</div>
              <div className="text-2xl font-bold text-pink-900 dark:text-pink-100">${stats?.avgOrderValue || "0"}</div>
            </Card>
          </div>

          {/* Filters & Search */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Order ID, customer name, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="label_pending">Label Pending</option>
                  <option value="awaiting_device">Awaiting Device</option>
                  <option value="in_transit">In Transit</option>
                  <option value="received">Received</option>
                  <option value="under_inspection">Under Inspection</option>
                  <option value="reoffer_pending">Reoffer Pending</option>
                  <option value="payout_pending">Payout Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <Button variant="outline" onClick={handleClearFilters} className="flex-1">
                  Clear Filters
                </Button>
                <Button onClick={() => refetch()} className="flex-1">
                  Apply
                </Button>
              </div>
            </div>
          </Card>

          {/* Orders Table */}
          <Card>
            {isLoading ? (
              <LoadingSpinner text="Loading orders..." />
            ) : error ? (
              <ErrorState message="Failed to load orders" onRetry={refetch} />
            ) : orders.length === 0 ? (
              <EmptyState
                icon="📦"
                title="No orders found"
                description="No orders match your current filters."
                action={{ label: "Clear Filters", onClick: handleClearFilters }}
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedOrders.length === orders.length}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Order #</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Value</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Created</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Label</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {orders.map((order: Order) => (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(order.id)}
                              onChange={() => handleSelectOrder(order.id)}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setDetailsModal(order.id)}
                              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {order.orderNumber}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {order.customerName || "Guest"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {order.customerEmail}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">
                            ${order.totalOriginalOffer}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={order.status}
                              onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                              className="text-sm border-0 bg-transparent font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1"
                            >
                              <option value="label_pending">Label Pending</option>
                              <option value="awaiting_device">Awaiting Device</option>
                              <option value="in_transit">In Transit</option>
                              <option value="received">Received</option>
                              <option value="under_inspection">Under Inspection</option>
                              <option value="reoffer_pending">Reoffer Pending</option>
                              <option value="payout_pending">Payout Pending</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.labelStatus === 'generated' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                              {order.labelStatus || 'none'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setDetailsModal(order.id)}
                                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="View Details"
                              >
                                👁️
                              </button>
                              {order.status === 'label_pending' && (
                                <button
                                  onClick={() => generateLabelMutation.mutate(order.id)}
                                  disabled={generateLabelMutation.isPending}
                                  className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                                  title="Generate Label"
                                >
                                  📦
                                </button>
                              )}
                              <button
                                onClick={() => setReofferModal(order.id)}
                                className="p-1.5 rounded hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                                title="Re-offer"
                              >
                                💰
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalOrders)} of {totalOrders} orders
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page * pageSize >= totalOrders}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Bulk Actions Bar */}
          {selectedOrders.length > 0 && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white rounded-lg shadow-2xl px-6 py-3 flex items-center gap-4">
              <span className="font-medium">{selectedOrders.length} selected</span>
              <div className="h-6 w-px bg-white/30" />
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                Generate Labels
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                Export
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => setSelectedOrders([])}>
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {detailsModal && (
          <OrderDetailsModal
            orderId={detailsModal}
            onClose={() => setDetailsModal(null)}
            onDelete={(id) => deleteOrderMutation.mutate(id)}
          />
        )}

        {/* Reoffer Modal */}
        {reofferModal && (
          <ReofferModal
            orderId={reofferModal}
            onClose={() => setReofferModal(null)}
          />
        )}
      </AdminLayout>
    </AdminProtected>
  );
}

// Order Details Modal Component
function OrderDetailsModal({ orderId, onClose, onDelete }: { orderId: string; onClose: () => void; onDelete: (id: string) => void }) {
  const { data: order, isLoading } = useQuery({
    queryKey: ["admin-order-detail", orderId],
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/admin/orders/${orderId}`));
      if (!res.ok) throw new Error("Failed to fetch order");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <AdminModal isOpen={true} onClose={onClose} title="Order Details" showFooter={false}>
        <LoadingSpinner text="Loading order details..." />
      </AdminModal>
    );
  }

  if (!order) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminModal isOpen={true} onClose={onClose} title={`Order ${order.orderNumber}`} size="xl" showFooter={false}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Status & Timeline */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Status</div>
            <StatusBadge status={order.status} className="mt-1" />
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Value</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${parseFloat(order.totalOriginalOffer || '0').toFixed(2)}
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <span className="text-xl">👤</span>
            Customer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col">
              <span className="text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Name</span>
              <span className="font-medium text-gray-900 dark:text-white mt-1">{order.customerName || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Email</span>
              <span className="font-medium text-gray-900 dark:text-white mt-1">{order.customerEmail || "N/A"}</span>
            </div>
            {order.customerPhone && (
              <div className="flex flex-col">
                <span className="text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Phone</span>
                <span className="font-medium text-gray-900 dark:text-white mt-1">{order.customerPhone}</span>
              </div>
            )}
            {order.customerAddress && (
              <div className="flex flex-col md:col-span-2">
                <span className="text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Address</span>
                <span className="font-medium text-gray-900 dark:text-white mt-1">{order.customerAddress}</span>
              </div>
            )}
          </div>
        </div>

        {/* Device Items */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <span className="text-xl">📱</span>
            Devices ({order.items?.length || 0})
          </h3>
          {order.items && order.items.length > 0 ? (
            <div className="space-y-3">
              {order.items.map((item: any, idx: number) => (
                <div key={item.id} className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">#{idx + 1}</span>
                        <span className="font-bold text-lg text-gray-900 dark:text-white">
                          {item.deviceModel?.name || "Unknown Device"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {item.deviceVariant?.storageSizeGb && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Storage: </span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              {item.deviceVariant.storageSizeGb}GB
                            </span>
                          </div>
                        )}
                        {item.deviceVariant?.color && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Color: </span>
                            <span className="font-semibold">{item.deviceVariant.color}</span>
                          </div>
                        )}
                        {item.conditionProfile?.code && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Condition: </span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              {item.conditionProfile.code}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${parseFloat(item.originalOfferAmount || '0').toFixed(2)}
                      </div>
                      {item.finalOfferAmount && item.finalOfferAmount !== item.originalOfferAmount && (
                        <div className="text-sm text-amber-600 dark:text-amber-400 font-semibold">
                          Final: ${parseFloat(item.finalOfferAmount).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No items in this order</p>
          )}
        </div>

        {/* Shipment Info */}
        {order.shipment && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <span className="text-xl">📦</span>
              Shipping Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {order.shipment.trackingNumber && (
                <div className="flex flex-col">
                  <span className="text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Tracking Number</span>
                  <span className="font-mono font-medium text-gray-900 dark:text-white mt-1">{order.shipment.trackingNumber}</span>
                </div>
              )}
              {order.shipment.carrier && (
                <div className="flex flex-col">
                  <span className="text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold">Carrier</span>
                  <span className="font-medium text-gray-900 dark:text-white mt-1">{order.shipment.carrier}</span>
                </div>
              )}
              {order.shipment.labelUrl && (
                <div className="md:col-span-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(order.shipment.labelUrl, '_blank')}
                    className="w-full"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Download Shipping Label
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Timeline */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <span className="text-xl">⏱️</span>
            Timeline
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Created</span>
              <span className="font-medium">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
              <span className="font-medium">{formatDate(order.updatedAt)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Payout Status</span>
              <span className={`font-semibold px-2 py-1 rounded text-xs ${
                order.payoutStatus === 'completed' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                {order.payoutStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Notes */}
        {(order.notesAdmin || order.notesCustomer) && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <span className="text-xl">📝</span>
              Notes
            </h3>
            {order.notesAdmin && (
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Admin Notes</div>
                <div className="text-sm bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-200 dark:border-amber-800">
                  {order.notesAdmin}
                </div>
              </div>
            )}
            {order.notesCustomer && (
              <div>
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Customer Notes</div>
                <div className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                  {order.notesCustomer}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-900 -mx-6 px-6 pb-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm(`Delete order ${order.orderNumber} permanently? This cannot be undone.`)) {
                onDelete(orderId);
                onClose();
              }
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Order
          </Button>
        </div>
      </div>
    </AdminModal>
  );
}

// Reoffer Modal Component
function ReofferModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const [newOffer, setNewOffer] = useState("");
  const [notes, setNotes] = useState("");
  const toast = useToast();
  const queryClient = useQueryClient();

  const reofferMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(getApiUrl(`/api/admin/orders/${orderId}/re-offer`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newOffer: parseFloat(newOffer), notes }),
      });
      if (!res.ok) throw new Error("Failed to send re-offer");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Re-offer sent successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      onClose();
    },
    onError: () => {
      toast.error("Failed to send re-offer");
    },
  });

  return (
    <AdminModal
      isOpen={true}
      onClose={onClose}
      title="Send Re-offer"
      onConfirm={() => reofferMutation.mutate()}
      confirmText="Send Re-offer"
      isLoading={reofferMutation.isPending}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">New Offer Amount</label>
          <input
            type="number"
            step="0.01"
            value={newOffer}
            onChange={(e) => setNewOffer(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Enter new offer amount"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
            placeholder="Reason for re-offer..."
          />
        </div>
      </div>
    </AdminModal>
  );
}
