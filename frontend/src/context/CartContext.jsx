import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";

const CartContext = createContext(null);
const STORAGE_KEY = "in_minutes_cart";

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { restaurantId: null, restaurantName: null, items: [] };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addItem = useCallback((food, restaurant) => {
    setCart((prev) => {
      if (prev.restaurantId && prev.restaurantId !== restaurant._id && prev.items.length > 0) {
        // Switching restaurants clears the cart (common food-delivery pattern)
        toast("Started a new cart for " + restaurant.name, { icon: "🛒" });
        return {
          restaurantId: restaurant._id,
          restaurantName: restaurant.name,
          items: [{ foodId: food._id, name: food.name, price: food.price, image: food.image, quantity: 1 }],
        };
      }
      const existing = prev.items.find((i) => i.foodId === food._id);
      const items = existing
        ? prev.items.map((i) => (i.foodId === food._id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev.items, { foodId: food._id, name: food.name, price: food.price, image: food.image, quantity: 1 }];
      return { restaurantId: restaurant._id, restaurantName: restaurant.name, items };
    });
  }, []);

  const updateQuantity = useCallback((foodId, delta) => {
    setCart((prev) => {
      const items = prev.items
        .map((i) => (i.foodId === foodId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0);
      return { ...prev, items, restaurantId: items.length ? prev.restaurantId : null };
    });
  }, []);

  const removeItem = useCallback((foodId) => {
    setCart((prev) => {
      const items = prev.items.filter((i) => i.foodId !== foodId);
      return { ...prev, items, restaurantId: items.length ? prev.restaurantId : null };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({ restaurantId: null, restaurantName: null, items: [] });
  }, []);

  const totalItems = useMemo(() => cart.items.reduce((s, i) => s + i.quantity, 0), [cart.items]);
  const subtotal = useMemo(() => cart.items.reduce((s, i) => s + i.quantity * i.price, 0), [cart.items]);

  return (
    <CartContext.Provider
      value={{ cart, addItem, updateQuantity, removeItem, clearCart, totalItems, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
