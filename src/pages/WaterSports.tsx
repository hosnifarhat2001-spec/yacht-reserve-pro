import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WaterSport } from "@/types/services";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Users, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getSessionId } from "@/lib/sessionUtils";

const WaterSports = () => {
  const [activities, setActivities] = useState<WaterSport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("water_sports")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error loading activities:", error);
      toast({
        title: "Error",
        description: "Failed to load water sports activities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (activity: WaterSport, duration: 30 | 60) => {
    try {
      const sessionId = getSessionId();
      const price = duration === 30 ? activity.price_30min : activity.price_60min;

      const { error } = await supabase.from("service_cart_items").insert({
        session_id: sessionId,
        item_type: "water_sport",
        item_id: activity.id,
        item_name: activity.name,
        quantity: 1,
        duration: duration,
        price: price,
      });

      if (error) throw error;

      toast({
        title: "Added to Cart",
        description: `${activity.name} (${duration} min) added to cart`,
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
        <h1 className="text-4xl font-bold text-center mb-4">Water Sports Activities</h1>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Experience thrilling water sports adventures with our premium equipment and professional instructors
        </p>

        {loading ? (
          <div className="text-center py-12">Loading activities...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <Card 
                key={activity.id} 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {activity.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={activity.image_url}
                      alt={activity.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-3" style={{ color: 'hsl(20, 100%, 59%)' }}>
                    {activity.name}
                  </h3>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Users size={18} />
                    <span>Up to {activity.pax} pax</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-primary" />
                        <span>30 minutes</span>
                      </div>
                      <span className="font-bold text-lg">{activity.price_30min} AED</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-primary" />
                        <span>60 minutes</span>
                      </div>
                      <span className="font-bold text-lg">{activity.price_60min} AED</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex gap-2">
                  <Button
                    onClick={() => addToCart(activity, 30)}
                    className="flex-1"
                    style={{ backgroundColor: 'hsl(20, 100%, 59%)' }}
                  >
                    Add 30 min
                  </Button>
                  <Button
                    onClick={() => addToCart(activity, 60)}
                    className="flex-1"
                    style={{ backgroundColor: 'hsl(20, 100%, 59%)' }}
                  >
                    Add 60 min
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

export default WaterSports;
