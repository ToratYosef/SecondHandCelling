import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "../../components/AdminLayout";
import { AdminProtected } from "../../components/AdminProtected";
import { LoadingSpinner, EmptyState, ErrorState } from "../../components/AdminUtilities";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState("month");
  const [metric, setMetric] = useState("count");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-analytics-full", dateRange],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics/full?range=${dateRange}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  const analytics = data || {};
  const ordersOverTime = analytics.ordersOverTime || [];
  const statusDistribution = analytics.statusDistribution || [];
  const topDevices = analytics.topDevices || [];
  const revenue = analytics.revenue || {};

  const statusColors = {
    label_pending: "#3b82f6",
    awaiting_device: "#8b5cf6",
    in_transit: "#06b6d4",
    received: "#10b981",
    under_inspection: "#f59e0b",
    reoffer_pending: "#f97316",
    payout_pending: "#ec4899",
    completed: "#22c55e",
    cancelled: "#ef4444",
  };

  return (
    <AdminProtected>
      <AdminLayout>
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Performance metrics and trends</p>
            </div>
            <div className="flex gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
                <option value="year">Last Year</option>
              </select>
              <Button onClick={() => refetch()}>Refresh</Button>
            </div>
          </div>

          {isLoading ? (
            <LoadingSpinner text="Loading analytics..." />
          ) : error ? (
            <ErrorState message="Failed to load analytics" onRetry={refetch} />
          ) : (
            <>
              {/* Revenue Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 border-green-200 dark:border-green-800">
                  <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Total Revenue</div>
                  <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                    ${revenue.totalPaidOut || "0.00"}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                    in selected range
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/30 border-blue-200 dark:border-blue-800">
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Avg Order Value</div>
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                    ${revenue.avgOrderValue || "0.00"}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    per order
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-800/30 border-purple-200 dark:border-purple-800">
                  <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">Total Orders</div>
                  <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                    {revenue.totalOrders || 0}
                  </div>
                  <div className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                    in selected range
                  </div>
                </Card>
              </div>

              {/* Orders Over Time Chart */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Orders Over Time</h3>
                  <select
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                  >
                    <option value="count">Order Count</option>
                    <option value="value">Total Value</option>
                  </select>
                </div>
                {ordersOverTime.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={ordersOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey={metric === "count" ? "orders" : "value"}
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name={metric === "count" ? "Orders" : "Value ($)"}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState icon="📊" title="No data available" />
                )}
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
                  {statusDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {statusDistribution.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={statusColors[entry.status as keyof typeof statusColors] || "#999"} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState icon="📊" title="No data available" />
                  )}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    {statusDistribution.map((status: any) => (
                      <div key={status.status} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: statusColors[status.status as keyof typeof statusColors] || "#999" }}
                        ></div>
                        <span className="capitalize">{status.status.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Top Devices */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Top Devices by Revenue</h3>
                  {topDevices.length > 0 ? (
                    <div className="space-y-3">
                      {topDevices.slice(0, 10).map((device: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{device.model || "Unknown"}</div>
                              <div className="text-xs text-gray-500">{device.count} orders</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600 dark:text-green-400">
                              ${device.totalAmount}
                            </div>
                            <div className="text-xs text-gray-500">
                              avg ${device.avgAmount}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon="📱" title="No device data" />
                  )}
                </Card>
              </div>

              {/* Conversion Funnel */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Order Conversion Funnel</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { step: "Quote Created", count: analytics.funnel?.quotes || 0 },
                      { step: "Label Generated", count: analytics.funnel?.labeled || 0 },
                      { step: "Device Shipped", count: analytics.funnel?.shipped || 0 },
                      { step: "Device Received", count: analytics.funnel?.received || 0 },
                      { step: "Inspection Done", count: analytics.funnel?.inspected || 0 },
                      { step: "Payment Sent", count: analytics.funnel?.completed || 0 },
                    ]}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="step" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </>
          )}
        </div>
      </AdminLayout>
    </AdminProtected>
  );
}
