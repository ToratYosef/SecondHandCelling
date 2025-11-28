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

    try {
      const response = await fetch(getApiUrl("/api/admin/pricing/import-xml"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ xml: xmlContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import XML");
      }

      setUploadResult({
        success: true,
        message: "XML imported successfully!",
        details: data,
      });
      
      // Clear the textarea after successful upload
      setXmlContent("");
    } catch (error: any) {
      setUploadResult({
        success: false,
        message: error.message || "Failed to import XML",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Pricing Management</h1>
          <p className="text-muted-foreground mt-2">
            Upload XML feed to update device models, variants, and pricing tiers
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Import XML Feed</CardTitle>
            <CardDescription>
              Paste XML content or upload an XML file. The system will automatically parse models,
              create variants for different storage/carrier combinations, and set up pricing tiers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Upload XML File (Optional)</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xml,text/xml,application/xml"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="xml-content">XML Content</Label>
                <Textarea
                  id="xml-content"
                  placeholder="Paste your XML content here or use the file upload above..."
                  value={xmlContent}
                  onChange={(e) => setXmlContent(e.target.value)}
                  className="font-mono text-sm min-h-[400px]"
                />
              </div>

              {uploadResult && (
                <Alert variant={uploadResult.success ? "default" : "destructive"}>
                  <div className="flex items-start gap-3">
                    {uploadResult.success ? (
                      <CheckCircle className="h-5 w-5 mt-0.5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <AlertDescription>
                        <div className="font-semibold mb-2">{uploadResult.message}</div>
                        {uploadResult.details && (
                          <div className="space-y-1 text-sm">
                            <div>Models Created: {uploadResult.details.modelsCreated}</div>
                            <div>Models Updated: {uploadResult.details.modelsUpdated}</div>
                            <div>Variants Created: {uploadResult.details.variantsCreated}</div>
                            <div>Price Tiers Created: {uploadResult.details.priceTiersCreated}</div>
                            {uploadResult.details.errors.length > 0 && (
                              <div className="mt-2">
                                <div className="font-semibold">Errors:</div>
                                <ul className="list-disc list-inside">
                                  {uploadResult.details.errors.map((error, idx) => (
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

              <div className="flex gap-3">
                <Button type="submit" disabled={isUploading || !xmlContent.trim()}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import XML
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setXmlContent("");
                    setUploadResult(null);
                  }}
                  disabled={isUploading}
                >
                  Clear
                </Button>
              </div>
            </form>
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
