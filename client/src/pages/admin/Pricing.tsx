import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Download, CheckCircle, AlertCircle } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useState } from "react";

export default function AdminPricing() {
  const [xmlUrl, setXmlUrl] = useState("https://secondhandcell.com/feeds/NewFeed.xml");
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
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

  const handleImport = async () => {
    if (!xmlUrl.trim()) {
      setImportResult({
        success: false,
        message: "Please provide a valid XML URL",
      });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const response = await fetch(getApiUrl("/api/admin/pricing/import-from-url"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ url: xmlUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import XML");
      }

      setImportResult({
        success: true,
        message: "XML imported successfully!",
        details: data,
      });
    } catch (error: any) {
      setImportResult({
        success: false,
        message: error.message || "Failed to import XML",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Pricing Management</h1>
          <p className="text-muted-foreground mt-2">
            Import device models and pricing from XML feed
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Import from XML URL</CardTitle>
            <CardDescription>
              Fetch and import device models and pricing from an XML feed URL
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="xml-url">XML Feed URL</Label>
                <Input
                  id="xml-url"
                  type="url"
                  placeholder="https://example.com/feed.xml"
                  value={xmlUrl}
                  onChange={(e) => setXmlUrl(e.target.value)}
                  className="mt-2"
                />
              </div>

              <Button
                onClick={handleImport}
                disabled={isImporting || !xmlUrl.trim()}
                className="w-full"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Import from URL
                  </>
                )}
              </Button>

              {importResult && (
                <Alert variant={importResult.success ? "default" : "destructive"}>
                  <div className="flex items-start gap-3">
                    {importResult.success ? (
                      <CheckCircle className="h-5 w-5 mt-0.5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <AlertDescription>
                        <div className="font-semibold mb-2">{importResult.message}</div>
                        {importResult.details && (
                          <div className="space-y-1 text-sm">
                            <div>Models Created: {importResult.details.modelsCreated}</div>
                            <div>Models Updated: {importResult.details.modelsUpdated}</div>
                            <div>Variants Created: {importResult.details.variantsCreated}</div>
                            <div>Price Tiers Created: {importResult.details.priceTiersCreated}</div>
                            {importResult.details.errors.length > 0 && (
                              <div className="mt-2">
                                <div className="font-semibold">Errors:</div>
                                <ul className="list-disc list-inside">
                                  {importResult.details.errors.map((error, idx) => (
                                    <li key={idx}>{error}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>XML Format Reference</CardTitle>
            <CardDescription>Expected XML structure for device models and pricing</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`<?xml version="1.0" encoding="UTF-8"?>
<models>
  <model>
    <parentDevice>iphone</parentDevice>
    <modelID>12-pro</modelID>
    <name>IPHONE 12 PRO</name>
    <brand>iphone</brand>
    <slug>12-pro</slug>
    <imageUrl>https://example.com/image.webp</imageUrl>
    <deeplink>https://secondhandcell.com/sell/?device=...</deeplink>
    <prices>
      <storageSize>128GB</storageSize>
      <priceValue>
        <att>
          <flawless>168.98</flawless>
          <good>168.98</good>
          <fair>122</fair>
          <broken>56</broken>
        </att>
        <unlocked>
          <flawless>168.98</flawless>
          <good>168.98</good>
          <fair>122</fair>
          <broken>59</broken>
        </unlocked>
      </priceValue>
    </prices>
  </model>
</models>`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
