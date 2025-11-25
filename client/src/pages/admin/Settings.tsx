import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getApiUrl } from "@/lib/api";

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/settings");
      return res.json();
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (form: FormData) => {
      const res = await fetch(getApiUrl("/api/admin/settings"), {
        method: "POST",
        body: form,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Success", description: "Settings updated" });
      setLogoFile(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update settings", variant: "destructive" });
    },
  });

  const handleSave = () => {
    const form = new FormData();
    if (logoFile) form.append("logoFile", logoFile);
    if (logoUrl) form.append("logoUrl", logoUrl);
    updateSettingsMutation.mutate(form);
  };

  return (
    <main className="p-8 max-w-xl mx-auto">
      <Card className="p-8 space-y-6">
        <h1 className="text-2xl font-bold mb-4">Sitewide Settings</h1>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Logo URL</label>
            <Input
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Or Upload Logo Image</label>
            <Input
              type="file"
              accept="image/*"
              onChange={e => setLogoFile(e.target.files?.[0] || null)}
            />
          </div>
          <Button onClick={handleSave} disabled={updateSettingsMutation.isPending}>
            {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
        {settings?.logoUrl && (
          <div className="mt-6">
            <span className="block mb-2 font-medium">Current Logo Preview:</span>
            <img src={settings.logoUrl} alt="Site Logo" className="h-16" />
          </div>
        )}
      </Card>
    </main>
  );
}
