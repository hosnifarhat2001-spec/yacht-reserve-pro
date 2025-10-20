import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Yacht } from '@/types';

interface CartItem {
  yacht: Yacht;
  startDate?: string;
  endDate?: string;
  totalPrice?: number;
}

interface CartStore {
  items: CartItem[];
  addToCart: (yacht: Yacht) => void;
  removeFromCart: (yachtId: string) => void;
  clearCart: () => void;
  isInCart: (yachtId: string) => boolean;
  getItemCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (yacht: Yacht) => {
        console.log('Adding to cart:', yacht);
        const { items } = get();
        if (!items.find((item) => item.yacht.id === yacht.id)) {
          const newItems = [...items, { yacht }];
          console.log('Cart updated, new items:', newItems);
          set({ items: newItems });
        } else {
          console.log('Item already in cart');
        }
      },
      
      removeFromCart: (yachtId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.yacht.id !== yachtId),
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      isInCart: (yachtId: string) => {
        return get().items.some((item) => item.yacht.id === yachtId);
      },
      
      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'yacht-cart-storage',
    }
  )
);
