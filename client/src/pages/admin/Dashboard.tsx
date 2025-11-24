import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminProtected } from "@/components/AdminProtected";
import { Card } from "@/components/ui/card";
import { FileText, Package, DollarSign, AlertCircle, TrendingUp, Users, Smartphone } from "lucide-react";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    activeDevices: 0
  });
  const [agingOrders, setAgingOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(res => res.json())
      .then(data => {
        setMetrics(data.metrics || {});
        setAgingOrders(data.aging || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load analytics:", err);
        setLoading(false);
      });
  }, []);

  return (
    <AdminProtected>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Overview of platform activity and metrics</p>
            </div>
            {loading ? (
              <div className="text-center py-12">Loading analytics...</div>
            ) : (
              <>
                {/* Key Metrics */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{metrics.totalOrders}</div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{metrics.completedOrders}</div>
                    <p className="text-sm text-muted-foreground">Completed Orders</p>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{metrics.pendingOrders}</div>
                    <p className="text-sm text-muted-foreground">Pending Orders</p>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{metrics.avgProcessingTime} days</div>
                    <p className="text-sm text-muted-foreground">Avg Processing Time</p>
                  </Card>
                </div>
                {/* Aging Orders Table */}
                <Card className="p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-6">Aging Orders</h2>
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Status</th>
                        <th>Age (days)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agingOrders.map(order => (
                        <tr key={order.id} className={order.ageDays > 7 ? "bg-amber-50 dark:bg-amber-900/20" : ""}>
                          <td className="font-mono">{order.orderNumber}</td>
                          <td>{order.status}</td>
                          <td>{order.ageDays}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                      <a href="/admin/devices" className="p-4 border rounded-md hover-elevate active-elevate-2 transition-all text-center">
                        <Smartphone className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">Manage Devices</p>
                      </a>
                      <a href="/admin/orders" className="p-4 border rounded-md hover-elevate active-elevate-2 transition-all text-center">
                        <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">View Orders</p>
                      </a>
                      <a href="/admin/inspections" className="p-4 border rounded-md hover-elevate active-elevate-2 transition-all text-center">
                        <AlertCircle className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">Inspections</p>
                      </a>
                      <a href="/admin/support" className="p-4 border rounded-md hover-elevate active-elevate-2 transition-all text-center">
                        <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">Support Tickets</p>
                      </a>
                    </div>
                  </Card>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </AdminProtected>
  );
}
