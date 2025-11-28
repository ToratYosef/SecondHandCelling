import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useState } from "react";

export default function AdminPricing() {
  const [xmlContent, setXmlContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    details?: {
      modelsCreated: number;
      modelsUpdated: number;
      variantsCreated: number;
      priceTiersCreated: number;
      errors: string[];
    };
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setXmlContent(content);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!xmlContent.trim()) {
      setUploadResult({
        success: false,
        message: "Please provide XML content",
      });
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    // Bulk edit handler
    const handleBulkEditChange = (value: string) => {
      const updates: Record<string, string> = {};
      selectedRules.forEach(id => {
        updates[id] = value;
      });
      setBulkEdit(updates);
    };
    const saveBulkEdit = async () => {
      await Promise.all(selectedRules.map(async ruleId => {
        const price = bulkEdit[ruleId];
        if (!price) return;
        await fetch(getApiUrl(`/api/admin/pricing/${ruleId}`), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ basePrice: price }),
          credentials: 'include',
        });
      }));
      setBulkEdit({});
      setSelectedRules([]);
    };

    // Export pricing rules as CSV
    const exportCSV = () => {
      if (!pricingRules) return;
      const header = ["Device","Variant","Condition","Base Price"];
      const rows = pricingRules.map(rule => {
        const device: any = devices?.find((d: any) => d.variants.some((v: any) => v.id === rule.variantId));
        const variant = device?.variants.find((v: { id: any; }) => v.id === rule.variantId);
        const condition = conditions?.find(c => c.id === rule.conditionProfileId);
        return [device?.name, `${variant?.storageGb}GB ${variant?.color || ''} ${variant?.networkCarrier}`, condition?.name, rule.basePrice];
      });
      const csv = [header, ...rows].map(r => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pricing_rules.csv';
      a.click();
      URL.revokeObjectURL(url);
    };

    // Import pricing rules from CSV
    const importCSV = async (file: File) => {
      const text = await file.text();
      const lines = text.split(/\r?\n/);
      for (let i = 1; i < lines.length; i++) {
        const [deviceName, variantStr, conditionName, basePrice] = lines[i].split(',');
        const device = devices?.find(d => d.name === deviceName);
        const variant = device?.variants.find((v: { storageGb: any; color: any; networkCarrier: any; }) => `${v.storageGb}GB ${v.color || ''} ${v.networkCarrier}` === variantStr);
        const condition = conditions?.find(c => c.name === conditionName);
        const rule = pricingRules?.find(r => r.variantId === variant?.id && r.conditionProfileId === condition?.id);
        if (rule && basePrice) {
          await fetch(getApiUrl(`/api/admin/pricing/${rule.id}`), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ basePrice }),
            credentials: 'include',
          });
        }
      }
      alert('Import complete!');
    };

    // Fetch audit log (placeholder)
    const fetchAuditLog = async () => {
      // Replace with real API endpoint
      setAuditLog([
        { ruleId: '1', user: 'admin', action: 'edit', oldPrice: '100', newPrice: '120', date: '2025-11-22' },
        { ruleId: '2', user: 'admin', action: 'bulk edit', oldPrice: '200', newPrice: '210', date: '2025-11-22' },
      ]);
      setShowAudit(true);
    };
  const { data: devices, isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/devices'],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  const { data: conditions } = useQuery<any[]>({
    queryKey: ['/api/conditions'],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  const { data: pricingRules } = useQuery<any[]>({
    queryKey: ['/api/pricing/rules'],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  const [editPrices, setEditPrices] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const handlePriceChange = (ruleId: string, value: string) => {
    setEditPrices((prev) => ({ ...prev, [ruleId]: value }));
  };
  const savePrice = async (ruleId: string) => {
    const price = editPrices[ruleId];
    if (!price) return;
    await fetch(getApiUrl(`/api/admin/pricing/${ruleId}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ basePrice: price }),
      credentials: 'include',
    });
    setEditPrices((prev) => ({ ...prev, [ruleId]: '' }));
  };

  return (
    <AdminProtected>
      <div className="flex min-h-screen">
        <AdminSidebar />
        
        <main className="flex-1 p-8">
                {/* Bulk Edit, Export/Import, Audit Log Controls */}
                <div className="flex gap-4 mb-6">
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Bulk edit price..."
                      value={selectedRules.length > 0 ? bulkEdit[selectedRules[0]] ?? '' : ''}
                      onChange={e => handleBulkEditChange(e.target.value)}
                      className="w-32"
                      disabled={selectedRules.length === 0}
                    />
                    <Button size="sm" onClick={saveBulkEdit} disabled={selectedRules.length === 0}>Apply Bulk Edit</Button>
                  </div>
                  <Button size="sm" variant="outline" onClick={exportCSV}>Export CSV</Button>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Button size="sm" variant="outline" asChild>
                      <span>Import CSV</span>
                    </Button>
                    <input type="file" accept=".csv" style={{ display: 'none' }} onChange={e => {
                      if (e.target.files?.[0]) importCSV(e.target.files[0]);
                    }} />
                  </label>
                  <Button size="sm" variant="outline" onClick={fetchAuditLog}>View Audit Log</Button>
                </div>

                {/* Audit Log Modal */}
                {showAudit && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg max-w-lg w-full p-8 relative">
                      <button className="absolute top-4 right-4 text-xl" onClick={() => setShowAudit(false)}>&times;</button>
                      <h2 className="text-2xl font-bold mb-4">Audit Log</h2>
                      <div className="space-y-2">
                        {auditLog.length === 0 ? (
                          <div>No audit log entries found.</div>
                        ) : (
                          <table className="w-full text-sm">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Old Price</th>
                                <th>New Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {auditLog.map((entry, idx) => (
                                <tr key={idx}>
                                  <td>{entry.date}</td>
                                  <td>{entry.user}</td>
                                  <td>{entry.action}</td>
                                  <td>{entry.oldPrice}</td>
                                  <td>{entry.newPrice}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                      <div className="mt-6 flex gap-3">
                        <Button variant="outline" onClick={() => setShowAudit(false)}>Close</Button>
                      </div>
                    </div>
                  </div>
                )}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Pricing Management</h1>
              <p className="text-muted-foreground">Manage buyback pricing rules and penalties</p>
            </div>
            <div className="flex gap-2 items-center">
              <Input
                type="text"
                placeholder="Search devices or variants..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-64"
              />
              <select
                className="border rounded px-2 py-1"
                value={filterCondition}
                onChange={e => setFilterCondition(e.target.value)}
              >
                <option value="">All Conditions</option>
                {conditions && conditions.map(cond => (
                  <option key={cond.id} value={cond.id}>{cond.name}</option>
                ))}
              </select>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button data-testid="button-add-pricing-rule">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Pricing Rule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Pricing Rule</DialogTitle>
                  <DialogDescription>
                    Create a new pricing rule for a device variant and condition
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="base-price">Base Price</Label>
                    <Input id="base-price" type="number" step="0.01" placeholder="500.00" />
                  </div>
                  <div>
                    <Label htmlFor="penalty-financed">Penalty: Financed Device</Label>
                    <Input id="penalty-financed" type="number" step="0.01" placeholder="50.00" />
                  </div>
                  <div>
                    <Label htmlFor="penalty-power">Penalty: No Power</Label>
                    <Input id="penalty-power" type="number" step="0.01" placeholder="200.00" />
                  </div>
                  <div>
                    <Label htmlFor="penalty-functional">Penalty: Functional Issue</Label>
                    <Input id="penalty-functional" type="number" step="0.01" placeholder="150.00" />
                  </div>
                  <div>
                    <Label htmlFor="penalty-glass">Penalty: Cracked Glass</Label>
                    <Input id="penalty-glass" type="number" step="0.01" placeholder="75.00" />
                  </div>
                  <div>
                    <Label htmlFor="penalty-lock">Penalty: Activation Lock</Label>
                    <Input id="penalty-lock" type="number" step="0.01" placeholder="500.00" />
                  </div>
                  <Button className="w-full">Create Pricing Rule</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <Card>
              <div className="p-8 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </Card>
          ) : devices && devices.length > 0 ? (
            <Card>
              {devices.map((device) => (
                <div key={device.id} className="mb-8">
                  <h2 className="text-xl font-bold mb-2">{device.name}</h2>
                  {device.variants.map((variant: any) => (
                    <div key={variant.id} className="mb-4">
                      <h3 className="font-semibold">Variant: {variant.storageGb}GB {variant.color || ''} {variant.networkCarrier}</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Condition</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Save</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {conditions && conditions.map((cond) => {
                            const rule = pricingRules?.find(r => r.variantId === variant.id && r.conditionProfileId === cond.id);
                            return (
                              <TableRow key={cond.id}>
                                <TableCell>{cond.name}</TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={editPrices[rule?.id] ?? rule?.basePrice ?? ''}
                                    onChange={e => handlePriceChange(rule?.id, e.target.value)}
                                    placeholder="Price"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button size="sm" onClick={() => savePrice(rule?.id)} disabled={!editPrices[rule?.id]}>Save</Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              ))}
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No devices found</p>
            </Card>
          )}
        </div>
        </main>
      </div>
    </AdminProtected>
  );
}
