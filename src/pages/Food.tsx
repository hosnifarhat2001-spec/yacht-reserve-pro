import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FoodItem } from "@/types/services";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { UtensilsCrossed } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getSessionId } from "@/lib/sessionUtils";

const Food = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFoodItems();
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

  const addToCart = async (item: FoodItem, quantity: number = 1) => {
    try {
      const sessionId = getSessionId();

      const { error } = await supabase.from("service_cart_items").insert({
        session_id: sessionId,
        item_type: "food",
        item_id: item.id,
        item_name: item.name,
        quantity: quantity,
        price: item.price_per_person * quantity,
      });

      if (error) throw error;

      toast({
        title: "Added to Cart",
        description: `${item.name} added to cart`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      });
    }
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
                  <h3 className="text-2xl font-bold mb-3" style={{ color: 'hsl(20, 100%, 59%)' }}>
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
                    onClick={() => addToCart(item, 1)}
                    className="w-full"
                    style={{ backgroundColor: 'hsl(20, 100%, 59%)' }}
                  >
                    Add to Cart
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
