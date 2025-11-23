import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminProtected } from "@/components/AdminProtected";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

type DeviceBrand = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

type DeviceVariant = {
  id: string;
  modelId: string;
  storageGb: number;
  color: string | null;
  networkCarrier: string;
  hasEsim: boolean;
  isActive: boolean;
};

type DeviceModel = {
  id: string;
  brandId: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  year: number | null;
  isActive: boolean;
  variants: DeviceVariant[];
};

export default function AdminDevices() {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editDevice, setEditDevice] = useState<DeviceModel | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteDevice, setDeleteDevice] = useState<DeviceModel | null>(null);

    const editDeviceMutation = useMutation({
      mutationFn: async (data: any) => {
        const response = await apiRequest("PATCH", `/api/admin/models/${data.id}`, data);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/devices'] });
        toast({ title: "Success", description: "Device updated successfully" });
        setEditDialogOpen(false);
        setEditDevice(null);
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to update device", variant: "destructive" });
      },
    });

    const deleteDeviceMutation = useMutation({
      mutationFn: async (id: string) => {
        const response = await apiRequest("DELETE", `/api/admin/models/${id}`);
        if (!response.ok) throw new Error("Failed to delete device");
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/devices'] });
        toast({ title: "Deleted", description: "Device deleted successfully" });
        setDeleteDialogOpen(false);
        setDeleteDevice(null);
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to delete device", variant: "destructive" });
      },
    });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [xmlContent, setXmlContent] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    imageUrl: "",
    brandId: "",
  });
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: brands, isLoading: brandsLoading } = useQuery<DeviceBrand[]>({
    queryKey: ['/api/brands'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: devices, isLoading } = useQuery<DeviceModel[]>({
    queryKey: ['/api/admin/devices'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const addDeviceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/models", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/devices'] });
      toast({
        title: "Success",
        description: "Device added successfully",
      });
      resetFormData();
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add device",
        variant: "destructive",
      });
    },
  });
  const importXmlMutation = useMutation({
    mutationFn: async ({ xmlContent, xmlFile }: { xmlContent?: string; xmlFile?: File | null }) => {
      const formData = new FormData();
      if (xmlFile) {
        formData.append("xmlFile", xmlFile);
      } else if (xmlContent) {
        formData.append("xmlContent", xmlContent);
      }
      const response = await fetch("/api/admin/devices/import", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to import devices");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/devices'] });
      const successful = data.results.filter((r: any) => r.success).length;
      toast({
        title: "Import Complete",
        description: `Successfully imported ${successful} out of ${data.totalDevices} devices`,
      });
      setXmlContent("");
      setXmlFile(null);
      setIsImportDialogOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to import devices from XML",
        variant: "destructive",
      });
    },
  // removed stray closing parenthesis
  });

  const resetFormData = () => {
    setFormData({ name: "", slug: "", imageUrl: "", brandId: "" });
  };

  const handleAddDevice = () => {
    if (!formData.name || !formData.slug || !formData.brandId) {
      toast({
        title: "Error",
        description: "Name, slug, and brand are required",
        variant: "destructive",
      });
      return;
    }

    addDeviceMutation.mutate({
      brandId: formData.brandId,
      name: formData.name,
      slug: formData.slug,
      imageUrl: formData.imageUrl || null,
      isActive: true,
    });
  };
  const handleImportXml = () => {
    if (!xmlContent.trim() && !xmlFile) {
      toast({
        title: "Error",
        description: "Please paste XML content or upload a file",
        variant: "destructive",
      });
      return;
    }
    setImportLoading(true);
    importXmlMutation.mutate({ xmlContent: xmlContent.trim(), xmlFile });
    setImportLoading(false);
  // removed extra closing brace
  };

  return (
    <AdminProtected>
      <div className="flex min-h-screen">
        <AdminSidebar />

        <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Device Catalog</h1>
              <p className="text-muted-foreground">Manage device models and pricing</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Add Device</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Device</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="brand">Brand</Label>
                      <Select value={formData.brandId} onValueChange={(value) => setFormData({ ...formData, brandId: value })}>
                        <SelectTrigger id="brand" disabled={brandsLoading}>
                          <SelectValue placeholder="Select a brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands?.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="name">Device Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., iPhone 15 Pro"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        placeholder="e.g., iphone-15-pro"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                      <Input
                        id="imageUrl"
                        placeholder="https://example.com/image.jpg"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleAddDevice} disabled={addDeviceMutation.isPending}>
                      {addDeviceMutation.isPending ? "Adding..." : "Add Device"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Import from XML</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Import Devices from XML</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="xml">XML Content</Label>
                      <Textarea
                        id="xml"
                        placeholder="Paste your XML content here..."
                        value={xmlContent}
                        onChange={(e) => setXmlContent(e.target.value)}
                        rows={10}
                        className="font-mono text-sm"
                      />
                    <div>
                      <Label htmlFor="xmlFile">Or Upload XML File</Label>
                      <Input
                        id="xmlFile"
                        type="file"
                        accept=".xml"
                        ref={fileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setXmlFile(file);
                          if (file) setXmlContent("");
                        }}
                      />
                    </div>
                    </div>
                    <Button 
                      onClick={handleImportXml} 
                      disabled={importXmlMutation.isPending || importLoading}
                    >
                      {importXmlMutation.isPending || importLoading ? "Importing..." : "Import Devices"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device Model</TableHead>
                    <TableHead>Variants</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{device.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{device.variants?.length || 0}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {device.slug}
                      </TableCell>
                      <TableCell>
                        {device.isActive ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setEditDevice(device); setEditDialogOpen(true); }}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => { setDeleteDevice(device); setDeleteDialogOpen(true); }}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                  {/* Edit Device Dialog */}
                  <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Device</DialogTitle>
                      </DialogHeader>
                      {editDevice && (
                        <div className="space-y-4">
                          <Input
                            value={editDevice.name}
                            onChange={e => setEditDevice({ ...editDevice, name: e.target.value })}
                            placeholder="Device Name"
                          />
                          <Input
                            value={editDevice.slug}
                            onChange={e => setEditDevice({ ...editDevice, slug: e.target.value })}
                            placeholder="Slug"
                          />
                          <Input
                            value={editDevice.imageUrl || ""}
                            onChange={e => setEditDevice({ ...editDevice, imageUrl: e.target.value })}
                            placeholder="Image URL"
                          />
                          <Button onClick={() => editDeviceMutation.mutate(editDevice)} disabled={editDeviceMutation.isPending}>
                            {editDeviceMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {/* Delete Device Confirmation Dialog */}
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Device</DialogTitle>
                      </DialogHeader>
                      {deleteDevice && (
                        <div className="space-y-4">
                          <p>Are you sure you want to delete <b>{deleteDevice.name}</b>? This action cannot be undone.</p>
                          <Button variant="destructive" onClick={() => deleteDeviceMutation.mutate(deleteDevice.id)} disabled={deleteDeviceMutation.isPending}>
                            {deleteDeviceMutation.isPending ? "Deleting..." : "Confirm Delete"}
                          </Button>
                          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
            </Card>
          ) : (
            <Card>
              <div className="p-8 text-center text-muted-foreground">
                <p>No devices found. Start by adding a device or importing from XML.</p>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
    </AdminProtected>
  );
}
