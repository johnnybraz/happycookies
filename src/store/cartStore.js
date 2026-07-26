import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find(item => item.id === product.id);
        
        if (existingItem) {
          set({
            items: items.map(item => 
              item.id === product.id 
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          });
        } else {
          set({ items: [...items, { ...product, quantity }] });
        }
      },
      
      removeItem: (productId) => {
        const { items } = get();
        set({ items: items.filter(item => item.id !== productId) });
      },
      
      updateQuantity: (productId, quantity) => {
        const { items } = get();
        set({
          items: items.map(item => 
            item.id === productId 
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          )
        });
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + (parseFloat(item.price) * item.quantity), 
          0
        );
      }
    }),
    {
      name: 'happy-cookies-cart',
    }
  )
);

export default useCartStore;