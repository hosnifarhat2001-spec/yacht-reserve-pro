import { useState } from "react";
import { WaterSport } from "@/types/services";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WaterSportsManagementProps {
  activities: WaterSport[];
  onUpdate: () => void;
}

const WaterSportsManagement = ({ activities, onUpdate }: WaterSportsManagementProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<WaterSport>>({
    name: "",
    pax: 0,
    price_30min: 0,
    price_60min: 0,
    image_url: "",
    display_order: 0,
  });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase
          .from("water_sports")
          .update(formData)
          .eq("id", editingId);
        if (error) throw error;
        toast({ title: "Updated successfully" });
      } else {
        const { error } = await supabase.from("water_sports").insert([formData as WaterSport]);
        if (error) throw error;
        toast({ title: "Created successfully" });
      }
      resetForm();
      onUpdate();
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Operation failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const { error } = await supabase.from("water_sports").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted successfully" });
      onUpdate();
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Delete failed", variant: "destructive" });
    }
  };

  const startEdit = (activity: WaterSport) => {
    setEditingId(activity.id);
    setFormData(activity);
    setIsCreating(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({ name: "", pax: 0, price_30min: 0, price_60min: 0, image_url: "", display_order: 0 });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const ext = file.name.split('.').pop();
      const filePath = `sports/${(window.crypto?.randomUUID?.() || Date.now().toString())}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('water-sports-images')
        .upload(filePath, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: pub } = supabase.storage.from('water-sports-images').getPublicUrl(filePath);
      const publicUrl = pub.publicUrl;
      setFormData((prev) => ({ ...prev, image_url: publicUrl }));
      toast({ title: 'Image uploaded' });
    } catch (err: any) {
      console.error('Image upload failed:', err);
      toast({ title: 'Upload failed', description: err.message || 'Please try again', variant: 'destructive' });
    } finally {
      setUploading(false);
      e.currentTarget.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Water Sports Management</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2" size={16} />
          Add Activity
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Activity Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Max Passengers</Label>
                <Input
                  type="number"
                  value={formData.pax}
                  onChange={(e) => setFormData({ ...formData, pax: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (30 min) AED</Label>
                  <Input
                    type="number"
                    value={formData.price_30min}
                    onChange={(e) => setFormData({ ...formData, price_30min: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label>Price (60 min) AED</Label>
                  <Input
                    type="number"
                    value={formData.price_60min}
                    onChange={(e) => setFormData({ ...formData, price_60min: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Upload Image</Label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageSelect} 
                  disabled={uploading}
                  className="cursor-pointer"
                />
                {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading image...</p>}
                {formData.image_url && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={formData.image_url} alt="Preview" className="w-24 h-24 object-cover rounded border" />
                    <Button type="button" variant="ghost" onClick={() => setFormData({ ...formData, image_url: '' })}>
                      Remove image
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {activities.map((activity) => (
          <Card key={activity.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{activity.name}</h3>
                  <p className="text-muted-foreground">Up to {activity.pax} pax</p>
                  <div className="mt-2 space-y-1">
                    <p>30 min: {activity.price_30min} AED</p>
                    <p>60 min: {activity.price_60min} AED</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(activity)}>
                    <Pencil size={16} />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(activity.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WaterSportsManagement;
