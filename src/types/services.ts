export interface WaterSport {
  id: string;
  name: string;
  pax: number;
  price_30min: number;
  price_60min: number;
  image_url?: string;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  price_per_person: number;
  description?: string;
  image_url?: string;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AdditionalService {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceCartItem {
  id: string;
  session_id: string;
  item_type: 'water_sport' | 'food';
  item_id: string;
  item_name: string;
  quantity: number;
  duration?: number;
  price: number;
  created_at?: string;
}
