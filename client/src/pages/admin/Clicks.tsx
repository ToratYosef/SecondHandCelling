import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "../../components/AdminLayout";
import { AdminProtected } from "../../components/AdminProtected";
import { LoadingSpinner, EmptyState, ErrorState } from "../../components/AdminUtilities";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function AdminClicks() {
  const [deviceFamily, setDeviceFamily] = useState("all");
  const [dateRange, setDateRange] = useState("month");
  const [sortBy, setSortBy] = useState("clicks");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-clicks", deviceFamily, dateRange, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams({
        family: deviceFamily,
        range: dateRange,
        sortBy,
      });
      const res = await fetch(`/api/admin/clicks?${params}`);
      if (!res.ok) throw new Error("Failed to fetch clicks data");
      return res.json();
    },
  });

  const metrics = data?.metrics || {};
  const devices = data?.devices || [];

  return (
    <AdminProtected>
      <AdminLayout>
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Device Clicks Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track customer interest and conversion rates</p>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-800">
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Total Clicks</div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{metrics.totalClicks || 0}</div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-800">
              <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">Unique Devices</div>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{metrics.uniqueDevices || 0}</div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-800">
              <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Conversion Rate</div>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">{metrics.conversionRate || "0"}%</div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Device Family
                </label>
                <select
                  value={deviceFamily}
                  onChange={(e) => setDeviceFamily(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                >
                  <option value="all">All Devices</option>
                  <option value="iPhone">iPhone</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Google">Google</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                >
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last 90 Days</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                >
                  <option value="clicks">Total Clicks</option>
                  <option value="conversion">Conversion Rate</option>
                  <option value="orders">Orders</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={() => refetch()} className="w-full">Refresh</Button>
              </div>
            </div>
          </Card>

          {/* Device Click Table */}
          <Card>
            {isLoading ? (
              <LoadingSpinner text="Loading click data..." />
            ) : error ? (
              <ErrorState message="Failed to load click data" onRetry={refetch} />
            ) : devices.length === 0 ? (
              <EmptyState icon="📊" title="No click data available" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Device</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Total Clicks</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Orders</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Conversion Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Last Clicked</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {devices.map((device: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3">
                          <div className="font-medium">{device.name}</div>
                          <div className="text-xs text-gray-500">{device.family}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {device.clicks}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {device.orders}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${device.conversionRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold">{device.conversionRate}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {device.lastClicked ? new Date(device.lastClicked).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs">
                            {device.trend > 0 ? (
                              <span className="text-green-600 dark:text-green-400">↗ +{device.trend}%</span>
                            ) : device.trend < 0 ? (
                              <span className="text-red-600 dark:text-red-400">↘ {device.trend}%</span>
                            ) : (
                              <span className="text-gray-600 dark:text-gray-400">→ 0%</span>
                            )}
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
