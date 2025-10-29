import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdditionalService } from "@/types/services";
import { Pencil, Trash2, Plus, Upload } from "lucide-react";

interface AdditionalServicesManagementProps {
  services: AdditionalService[];
  onUpdate: () => void;
}

const AdditionalServicesManagement = ({ services, onUpdate }: AdditionalServicesManagementProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image_url: "",
    display_order: "0",
  });
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const serviceData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description || null,
        image_url: formData.image_url || null,
        display_order: parseInt(formData.display_order) || 0,
      };

      if (editingId) {
        const { error } = await supabase
          .from("additional_services")
          .update(serviceData)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Service updated successfully");
      } else {
        const { error } = await supabase
          .from("additional_services")
          .insert([serviceData]);

        if (error) throw error;
        toast.success("Service created successfully");
      }

      resetForm();
      onUpdate();
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Failed to save service");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const { error } = await supabase
        .from("additional_services")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Service deleted successfully");
      onUpdate();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete service");
    }
  };

  const startEdit = (service: AdditionalService) => {
    setEditingId(service.id);
    setShowForm(true);
    setFormData({
      name: service.name,
      price: service.price.toString(),
      description: service.description || "",
      image_url: service.image_url || "",
      display_order: service.display_order?.toString() || "0",
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      name: "",
      price: "",
      description: "",
      image_url: "",
      display_order: "0",
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("additional-services-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("additional-services-images")
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <h2 className="text-2xl font-bold">Additional Services Management</h2>
        <div className="flex items-center gap-2 ml-auto">
          <Input
            placeholder="Search services..."
            className="w-56"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="outline" onClick={() => setSearchQuery("")}>Clear</Button>
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({ name: "", price: "", description: "", image_url: "", display_order: "0" }); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services
          .filter((s) => {
            const q = searchQuery.trim().toLowerCase();
            if (!q) return true;
            return (
              s.name.toLowerCase().includes(q) ||
              (s.description || "").toLowerCase().includes(q)
            );
          })
          .map((service) => (
          <Card key={service.id} className="overflow-hidden">
            {service.image_url && (
              <img src={service.image_url} alt={service.name} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <h3 className="font-bold text-lg">{service.name}</h3>
              {service.description && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{service.description}</p>
              )}
              <p className="text-sm mb-3"><span className="text-muted-foreground">Price:</span> {service.price} AED</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => startEdit(service)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDelete(service.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Service" : "Add New Service"}
            </DialogTitle>
          </DialogHeader>
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price (AED)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="image">Service Image</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      disabled={uploading}
                    />
                    {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                  </div>
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="mt-2 h-32 object-cover rounded"
                    />
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingId ? "Update" : "Create"} Service
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdditionalServicesManagement;
