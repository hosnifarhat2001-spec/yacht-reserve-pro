import { useState } from "react";
import { FoodItem } from "@/types/services";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FoodManagementProps {
  foodItems: FoodItem[];
  onUpdate: () => void;
}

const FoodManagement = ({ foodItems, onUpdate }: FoodManagementProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<FoodItem>>({
    name: "",
    price_per_person: 0,
    description: "",
    image_url: "",
    display_order: 0,
  });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase
          .from("food_items")
          .update(formData)
          .eq("id", editingId);
        if (error) throw error;
        toast({ title: "Updated successfully" });
      } else {
        const { error } = await supabase.from("food_items").insert([formData as FoodItem]);
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
      const { error } = await supabase.from("food_items").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted successfully" });
      onUpdate();
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Delete failed", variant: "destructive" });
    }
  };

  const startEdit = (item: FoodItem) => {
    setEditingId(item.id);
    setFormData(item);
    setIsCreating(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({ name: "", price_per_person: 0, description: "", image_url: "", display_order: 0 });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const ext = file.name.split('.').pop();
      const filePath = `food/${(window.crypto?.randomUUID?.() || Date.now().toString())}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('food-images')
        .upload(filePath, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: pub } = supabase.storage.from('food-images').getPublicUrl(filePath);
      const publicUrl = pub.publicUrl;
      setFormData((prev) => ({ ...prev, image_url: publicUrl }));
      toast({ title: 'Image uploaded' });
    } catch (err: any) {
      console.error('Image upload failed:', err);
      toast({ title: 'Upload failed', description: err.message || 'Please try again', variant: 'destructive' });
    } finally {
      setUploading(false);
      // Clear the input value so same file can be reselected if needed
      e.currentTarget.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Food Menu Management</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2" size={16} />
          Add Food Item
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Item Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Price Per Person (AED)</Label>
                <Input
                  type="number"
                  value={formData.price_per_person}
                  onChange={(e) => setFormData({ ...formData, price_per_person: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
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
              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                />
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
        {foodItems.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <p className="text-muted-foreground mt-1">{item.description}</p>
                  <p className="mt-2 text-lg font-semibold">{item.price_per_person} AED per person</p>
                </div>
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-md border"
                  />
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                    <Pencil size={16} />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
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

export default FoodManagement;
