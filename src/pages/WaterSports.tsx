import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WaterSport } from "@/types/services";
import { Navigation } from "@/components/Navigation";
import { toast } from "@/hooks/use-toast";
import { WaterSportCard } from "@/components/WaterSportCard";

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
              <WaterSportCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default WaterSports;
