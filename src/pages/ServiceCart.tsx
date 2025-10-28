import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ServiceCartItem } from "@/types/services";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Trash2, Clock, UtensilsCrossed } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getSessionId } from "@/lib/sessionUtils";

const ServiceCart = () => {
  const [cartItems, setCartItems] = useState<ServiceCartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    try {
      const sessionId = getSessionId();
      const { data, error } = await supabase
        .from("service_cart_items")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCartItems((data || []) as ServiceCartItem[]);
    } catch (error) {
      console.error("Error loading cart:", error);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("service_cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setCartItems(cartItems.filter((item) => item.id !== itemId));
      toast({
        title: "Removed",
        description: "Item removed from cart",
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.price), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold text-center mb-4">Your Cart</h1>
        <p className="text-center text-muted-foreground mb-12">
          Review your selected services and proceed to checkout
        </p>

        {loading ? (
          <div className="text-center py-12">Loading cart...</div>
        ) : cartItems.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Button asChild style={{ backgroundColor: 'hsl(20, 100%, 59%)' }}>
                <a href="/water-sports">Browse Water Sports</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2" style={{ color: 'hsl(20, 100%, 59%)' }}>
                          {item.item_name}
                        </h3>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          {item.item_type === "water_sport" ? (
                            <>
                              <div className="flex items-center gap-1">
                                <Clock size={16} />
                                <span>{item.duration} minutes</span>
                              </div>
                              <span>Quantity: {item.quantity}</span>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-1">
                                <UtensilsCrossed size={16} />
                                <span>{item.quantity} person(s)</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold mb-2">{item.price} AED</p>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between text-xl font-bold mb-4">
                  <span>Total:</span>
                  <span style={{ color: 'hsl(20, 100%, 59%)' }}>{totalPrice} AED</span>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button 
                  className="w-full" 
                  size="lg"
                  style={{ backgroundColor: 'hsl(20, 100%, 59%)' }}
                >
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default ServiceCart;
