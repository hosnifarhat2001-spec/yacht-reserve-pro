import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AdditionalService } from "@/types/services";
import { ShoppingCart } from "lucide-react";

const AdditionalServices = () => {
  const { language, t } = useLanguage();
  const [services, setServices] = useState<AdditionalService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from("additional_services")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error loading additional services:", error);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (service: AdditionalService) => {
    toast.success(`${service.name} added to cart!`);
    // TODO: Implement cart functionality
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("خدمات إضافية", "Additional Services")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("عزز تجربة اليخت الخاصة بك مع خدماتنا المميزة", "Enhance your yacht experience with our premium services")}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-48 bg-muted" />
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card
                key={service.id}
                className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
              >
                <div className="relative h-48 overflow-hidden bg-muted">
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ShoppingCart className="w-16 h-16" />
                    </div>
                  )}
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {service.description}
                    </p>
                  )}
                  <p className="text-2xl font-bold text-primary">
                    {service.price} {t("درهم", "AED")}
                  </p>
                </CardContent>
                
                <CardFooter className="p-6 pt-0">
                  <Button
                    onClick={() => handleAddToCart(service)}
                    className="w-full"
                    size="lg"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {t("أضف إلى السلة", "Add to Cart")}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!loading && services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {t("لا توجد خدمات متاحة في الوقت الحالي", "No services available at the moment")}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdditionalServices;
