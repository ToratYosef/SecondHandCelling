import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "../../components/AdminLayout";
import { AdminProtected } from "../../components/AdminProtected";
import { LoadingSpinner, EmptyState, ErrorState } from "../../components/AdminUtilities";
import { useToast } from "../../components/AdminToast";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Link } from "wouter";

interface AgingOrder {
  id: string;
  orderNumber: string;
  status: string;
  ageDays: number;
  totalOriginalOffer: string;
  customerName?: string;
  customerEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminAging() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const toast = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-aging"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) throw new Error("Failed to fetch aging data");
      return res.json();
    },
  });

  const aging: AgingOrder[] = data?.aging || [];
  const metrics = data?.metrics || {};

  // Filter aging orders
  const filteredOrders = aging.filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    
    if (ageFilter !== "all") {
      const ranges: Record<string, [number, number]> = {
        "1-3": [1, 3],
        "4-7": [4, 7],
        "8-14": [8, 14],
        "15+": [15, 9999],
      };
      const [min, max] = ranges[ageFilter] || [0, 9999];
      if (order.ageDays < min || order.ageDays > max) return false;
    }
    
    return true;
  });

  const getPriorityColor = (ageDays: number) => {
    if (ageDays >= 15) return "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300";
    if (ageDays >= 8) return "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300";
    if (ageDays >= 4) return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300";
    return "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300";
  };

  const getPriorityLabel = (ageDays: number) => {
    if (ageDays >= 15) return "🔴 Critical";
    if (ageDays >= 8) return "🟠 High";
    if (ageDays >= 4) return "🟡 Medium";
    return "🟢 Normal";
  };

  return (
    <AdminProtected>
      <AdminLayout>
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Aging Orders</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor orders stuck in the pipeline</p>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-800">
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Total Orders</div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{metrics.totalOrders || 0}</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-800">
              <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Completed</div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{metrics.completedOrders || 0}</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-200 dark:border-amber-800">
              <div className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">Pending</div>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{metrics.pendingOrders || 0}</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-800">
              <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Avg Processing Time</div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{metrics.avgProcessingTime || 0} days</div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status Filter
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
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Age Range
                </label>
                <select
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Ages</option>
                  <option value="1-3">1-3 days</option>
                  <option value="4-7">4-7 days</option>
                  <option value="8-14">8-14 days</option>
                  <option value="15+">15+ days</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={() => { setStatusFilter("all"); setAgeFilter("all"); }} className="flex-1">
                  Clear Filters
                </Button>
              </div>
            </div>
          </Card>

          {/* Aging Orders Table */}
          <Card>
            {isLoading ? (
              <LoadingSpinner text="Loading aging data..." />
            ) : error ? (
              <ErrorState message="Failed to load aging data" onRetry={refetch} />
            ) : filteredOrders.length === 0 ? (
              <EmptyState
                icon="🎉"
                title="No aging orders"
                description="All orders are processing smoothly!"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Priority</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Order #</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Age (Days)</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Total Age</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Value</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredOrders.map((order) => (
                      <tr 
                        key={order.id} 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${getPriorityColor(order.ageDays)} border`}
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold">
                            {getPriorityLabel(order.ageDays)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href="/admin/dashboard">
                            <a className="font-medium hover:underline">
                              {order.orderNumber}
                            </a>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium">{order.customerName || "Guest"}</div>
                          <div className="text-xs text-gray-500">{order.customerEmail}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm capitalize">{order.status.replace('_', ' ')}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-2xl font-bold">{order.ageDays}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">
                          ${order.totalOriginalOffer}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href="/admin/dashboard">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Legend */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Priority Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">1-3 days (Normal)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm">4-7 days (Medium)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-500 rounded"></div>
                <span className="text-sm">8-14 days (High)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm">15+ days (Critical)</span>
              </div>
            </div>
          </Card>
        </div>
      </AdminLayout>
    </AdminProtected>
  );
}
