import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';

const CartContext = createContext({});

/**
 * Safely convert a value to a positive quantity.
 * Invalid values such as undefined, null, NaN, "NaN", etc.
 * become 1.
 */
const normalizeQuantity = (value) => {
  const quantity = Number(value);

  if (!Number.isFinite(quantity) || quantity < 1) {
    return 1;
  }

  return Math.floor(quantity);
};

/**
 * Safely convert a price to a valid number.
 */
const normalizePrice = (value) => {
  const price = Number(value);

  if (!Number.isFinite(price) || price < 0) {
    return 0;
  }

  return price;
};

/**
 * Make sure old/corrupted cart data is safe before using it.
 */
const normalizeCartItems = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item && item.foodId)
    .map((item) => ({
      ...item,
      price: normalizePrice(item.price),
      quantity: normalizeQuantity(item.quantity),
      instructions: item.instructions || '',
    }));
};

/**
 * Calculate cart totals safely.
 */
const calculateTotals = (items, discount = 0) => {
  const subtotal = items.reduce((sum, item) => {
    const price = normalizePrice(item.price);
    const quantity = normalizeQuantity(item.quantity);

    return sum + price * quantity;
  }, 0);

  const safeSubtotal = Number(subtotal.toFixed(2));

  const gst = Number((safeSubtotal * 0.05).toFixed(2));

  const safeDiscount = Number(discount);

  const finalDiscount =
    Number.isFinite(safeDiscount) && safeDiscount > 0
      ? safeDiscount
      : 0;

  const total = Number(
    Math.max(0, safeSubtotal + gst - finalDiscount).toFixed(2)
  );

  return {
    subtotal: safeSubtotal,
    gst,
    total,
  };
};

export const CartProvider = ({ children }) => {
  const [tableNumber, setTableNumber] = useState(
    () => sessionStorage.getItem('rm-table') || '1'
  );

  const [cartItems, setCartItems] = useState(() => {
    const stored = sessionStorage.getItem('rm-cart');

    if (!stored) {
      return [];
    }

    try {
      const parsed = JSON.parse(stored);

      return normalizeCartItems(parsed);
    } catch (error) {
      console.error('Failed to load cart from session storage:', error);

      sessionStorage.removeItem('rm-cart');

      return [];
    }
  });

  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem('rm-favorites');

    if (!stored) {
      return [];
    }

    try {
      const parsed = JSON.parse(stored);

      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error(
        'Failed to load favorites from local storage:',
        error
      );

      localStorage.removeItem('rm-favorites');

      return [];
    }
  });

  const [recentOrders, setRecentOrders] = useState(() => {
    const stored = localStorage.getItem('rm-recent-orders');

    if (!stored) {
      return [];
    }

    try {
      const parsed = JSON.parse(stored);

      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error(
        'Failed to load recent orders from local storage:',
        error
      );

      localStorage.removeItem('rm-recent-orders');

      return [];
    }
  });

  /**
   * Persist table number.
   */
  useEffect(() => {
    sessionStorage.setItem('rm-table', tableNumber);
  }, [tableNumber]);

  /**
   * Persist cart.
   */
  useEffect(() => {
    sessionStorage.setItem(
      'rm-cart',
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  /**
   * Persist favorites.
   */
  useEffect(() => {
    localStorage.setItem(
      'rm-favorites',
      JSON.stringify(favorites)
    );
  }, [favorites]);

  /**
   * Persist recent orders.
   */
  useEffect(() => {
    localStorage.setItem(
      'rm-recent-orders',
      JSON.stringify(recentOrders.slice(0, 5))
    );
  }, [recentOrders]);

  /**
   * Add item to cart.
   */
  const addToCart = (item) => {
  if (!item) {
    toast.error('Unable to add this item to cart');
    return;
  }

  // Support the different ID formats used by the API/frontend.
  const foodId = item.foodId || item._id || item.id;

  if (!foodId) {
    console.error('Invalid cart item:', item);
    toast.error('Unable to add this item to cart');
    return;
  }

  const price = normalizePrice(item.price);
  const quantity = normalizeQuantity(item.quantity);

  const safeItem = {
    ...item,
    foodId,
    price,
    quantity,
    instructions: item.instructions || '',
  };

  setCartItems((current) => {
    const existing = current.find(
      (entry) => entry.foodId === foodId
    );

    if (existing) {
      return current.map((entry) =>
        entry.foodId === foodId
          ? {
              ...entry,
              price: normalizePrice(entry.price),
              quantity:
                normalizeQuantity(entry.quantity) + quantity,
            }
          : entry
      );
    }

    return [...current, safeItem];
  });

  toast.success('Added to cart');
};

  /**
   * Update quantity.
   */
  const updateQuantity = (foodId, quantity) => {
  const safeQuantity = Number(quantity);

  if (!Number.isFinite(safeQuantity)) {
    return;
  }

  // Don't allow quantity below 1.
  if (safeQuantity < 1) {
    return;
  }

  const normalizedQuantity = Math.floor(safeQuantity);

  setCartItems((current) =>
    current.map((item) =>
      item.foodId === foodId
        ? {
            ...item,
            price: normalizePrice(item.price),
            quantity: normalizedQuantity,
          }
        : item
    )
  );
};

  /**
   * Update item-specific instructions.
   */
  const updateInstructions = (foodId, instructions) => {
    setCartItems((current) =>
      current.map((item) =>
        item.foodId === foodId
          ? {
              ...item,
              instructions: instructions || '',
            }
          : item
      )
    );
  };

  /**
   * Remove item from cart.
   */
  const removeItem = (foodId) => {
    setCartItems((current) =>
      current.filter((item) => item.foodId !== foodId)
    );
  };

  /**
   * Clear entire cart.
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /**
   * Toggle favorite item.
   */
  const toggleFavorite = (foodId) => {
    setFavorites((current) =>
      current.includes(foodId)
        ? current.filter((id) => id !== foodId)
        : [...current, foodId]
    );
  };

  /**
   * Store recently placed order.
   */
  const recordRecentOrder = (order) => {
    if (!order?._id) {
      return;
    }

    setRecentOrders((current) => [
      {
        orderId: order._id,
        items: order.items || [],
        createdAt: order.createdAt,
      },
      ...current,
    ]);
  };

  /**
   * Calculate totals whenever cart changes.
   */
  const totals = useMemo(
    () => calculateTotals(cartItems),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        tableNumber,
        setTableNumber,

        cartItems,

        addToCart,
        updateQuantity,
        updateInstructions,
        removeItem,
        clearCart,

        favorites,
        toggleFavorite,

        recentOrders,
        recordRecentOrder,

        totals,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);