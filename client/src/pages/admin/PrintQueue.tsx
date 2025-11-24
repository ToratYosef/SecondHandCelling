import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "../../components/AdminLayout";
import { AdminProtected } from "../../components/AdminProtected";
import { LoadingSpinner, EmptyState, ErrorState } from "../../components/AdminUtilities";
import { useToast } from "../../components/AdminToast";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

export default function AdminPrintQueue() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-print-queue"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders/needs-printing");
      if (!res.ok) throw new Error("Failed to fetch print queue");
      return res.json();
    },
  });

  const createBundleMutation = useMutation({
    mutationFn: async (orderIds: string[]) => {
      const res = await fetch("/api/admin/orders/needs-printing/bundle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds }),
      });
      if (!res.ok) throw new Error("Failed to create bundle");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Print bundle created successfully");
      if (data.bundleUrl) {
        window.open(data.bundleUrl, "_blank");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-print-queue"] });
      setSelectedOrders([]);
    },
    onError: () => {
      toast.error("Failed to create print bundle");
    },
  });

  const markKitSentMutation = useMutation({
    mutationFn: async (orderIds: string[]) => {
      await Promise.all(
        orderIds.map((id) =>
          fetch(`/api/admin/orders/${id}/mark-kit-sent`, { method: "POST" })
        )
      );
    },
    onSuccess: () => {
      toast.success("Orders marked as kit sent");
      queryClient.invalidateQueries({ queryKey: ["admin-print-queue"] });
      setSelectedOrders([]);
    },
    onError: () => {
      toast.error("Failed to mark orders");
    },
  });

  const generateLabelMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await fetch(`/api/admin/orders/${orderId}/shipment`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to generate label");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Label generated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-print-queue"] });
    },
    onError: () => {
      toast.error("Failed to generate label");
    },
  });

  const printQueue = orders || [];

  const handleSelectAll = () => {
    if (selectedOrders.length === printQueue.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(printQueue.map((o: any) => o.id));
    }
  };

  const handleSelectOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((oid) => oid !== id) : [...prev, id]
    );
  };

  return (
    <AdminProtected>
      <AdminLayout>
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Print Queue</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage shipping labels and bundles</p>
          </div>
          <Button onClick={() => refetch()}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>          {/* Queue Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-800">
              <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Labels Waiting</div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{printQueue.length}</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-800">
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Selected</div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{selectedOrders.length}</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-800">
              <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Total Value</div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                ${printQueue.reduce((sum: number, o: any) => sum + parseFloat(o.totalOriginalOffer || 0), 0).toFixed(2)}
              </div>
            </Card>
          </div>

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  {selectedOrders.length} orders selected
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => createBundleMutation.mutate(selectedOrders)}
                    disabled={createBundleMutation.isPending}
                  >
                    🖨️ Create Print Bundle
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => markKitSentMutation.mutate(selectedOrders)}
                    disabled={markKitSentMutation.isPending}
                  >
                    ✅ Mark Kit Sent
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedOrders([])}>
                    Clear
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Print Queue Table */}
          <Card>
            {isLoading ? (
              <LoadingSpinner text="Loading print queue..." />
            ) : error ? (
              <ErrorState message="Failed to load print queue" onRetry={refetch} />
            ) : printQueue.length === 0 ? (
              <EmptyState
                icon="🎉"
                title="Print queue is empty"
                description="All labels have been printed!"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedOrders.length === printQueue.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Order #</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Label Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Value</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {printQueue.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => handleSelectOrder(order.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{order.customerName || "Guest"}</div>
                          <div className="text-xs text-gray-500">{order.customerEmail}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                            {order.labelStatus || "pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">
                          ${order.totalOriginalOffer}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!order.labelStatus || order.labelStatus === "pending" ? (
                              <Button
                                size="sm"
                                onClick={() => generateLabelMutation.mutate(order.id)}
                                disabled={generateLabelMutation.isPending}
                              >
                                Generate Label
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline">
                                View Label
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markKitSentMutation.mutate([order.id])}
                            >
                              Mark Sent
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </AdminLayout>
    </AdminProtected>
  );
}
