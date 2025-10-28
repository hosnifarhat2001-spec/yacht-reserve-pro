import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FoodItem } from "@/types/services";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { UtensilsCrossed } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { settingsService } from "@/lib/storage";

const Food = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");

  useEffect(() => {
    loadFoodItems();
    loadWhatsAppNumber();
  }, []);

  const loadFoodItems = async () => {
    try {
      const { data, error } = await supabase
        .from("food_items")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setFoodItems(data || []);
    } catch (error) {
      console.error("Error loading food items:", error);
      toast({
        title: "Error",
        description: "Failed to load food menu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWhatsAppNumber = async () => {
    try {
      const number = await settingsService.getWhatsAppNumber();
      setWhatsappNumber(number);
    } catch (error) {
      console.error("Error loading WhatsApp number:", error);
    }
  };

  const handleWhatsAppOrder = (item: FoodItem) => {
    if (!whatsappNumber) {
      toast({
        title: "WhatsApp not configured",
        description: "Please set the WhatsApp number in settings.",
        variant: "destructive",
      });
      return;
    }

    const message = encodeURIComponent(
      `Hello! I want to order from the Food Menu.\n\n` +
      `Item: ${item.name}\n` +
      (item.description ? `Details: ${item.description}\n` : "") +
      `Price per person: ${item.price_per_person} AED\n\n` +
      `Please let me know the next steps.`
    );
    const url = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold text-center mb-4">Food Menu</h1>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Indulge in our carefully curated menu selections, perfect for your yacht experience
        </p>

        {loading ? (
          <div className="text-center py-12">Loading menu...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foodItems.map((item) => (
              <Card 
                key={item.id} 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {item.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-3 text-primary">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-muted-foreground mb-4">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed size={18} className="text-primary" />
                      <span>Per Person</span>
                    </div>
                    <span className="font-bold text-xl">{item.price_per_person} AED</span>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button
                    onClick={() => handleWhatsAppOrder(item)}
                    className="w-full bg-gradient-ocean hover:opacity-90"
                  >
                    Book now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Food;
