import { create } from 'zustand';
import { 
  OrderService, Order, ApiResponse, OrderStatus, 
  CartToOrderInput, UpdateOrderInput
} from '../services/order';
import { useCartStore } from './CartStore';
import { useAuthStore } from './AuthStore';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  
  // Fetch all orders for current user
  fetchUserOrders: () => Promise<void>;
  
  // Get a specific order
  getOrderById: (orderId: string) => Promise<Order | null>;
  
  // Create orders from cart items (checkout)
  checkoutCart: (
    address: string,
    phoneNumber: string,
    postalCode?: string,
    paymentMethod?: 'COD' | 'VIETQR' | 'VNPAY'
  ) => Promise<ApiResponse<Order[]>>;
  
  // Update order status
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  
  // Cancel an order
  cancelOrder: (orderId: string) => Promise<boolean>;
  
  clearOrderError: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  clearOrderError: () => set({ error: null }),
  
  fetchUserOrders: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const authStore = useAuthStore.getState();
      
      if (!authStore.user) {
        set({ error: 'User not authenticated', isLoading: false });
        return;
      }

      const response = await OrderService.getUserOrders(authStore.user.id);
      if (response.success && response.data) {
        set({ orders: response.data, isLoading: false });
      } else {
        set({ 
          error: response.message || 'Failed to fetch orders', 
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
        isLoading: false 
      });
    }
  },
  
  getOrderById: async (orderId: string): Promise<Order | null> => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await OrderService.getOrderById(orderId);
      if (response.success && response.data) {
        const order = response.data;
        set({ currentOrder: order, isLoading: false });
        return order;
      } else {
        set({ 
          error: response.message || `Failed to fetch order ${orderId}`, 
          isLoading: false,
          currentOrder: null
        });
        return null;
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : `Failed to fetch order ${orderId}`,
        isLoading: false,
        currentOrder: null
      });
      return null;
    }
  },
    checkoutCart: async (
    address: string,
    phoneNumber: string,
    postalCode?: string,
    paymentMethod: 'COD' | 'VIETQR' | 'VNPAY' = 'COD'
  ): Promise<ApiResponse<Order[]>> => {
    console.log('Starting checkout process...');
    console.log('Address:', address);
    console.log('Phone Number:', phoneNumber);
    console.log('Postal Code:', postalCode);
    console.log('Payment Method:', paymentMethod);
    set({ isLoading: true, error: null });
    
    try {
      const authStore = useAuthStore.getState();
      const cartStore = useCartStore.getState();
      
      if (!authStore.user) {
        set({ error: 'User not authenticated', isLoading: false });
        return {
          success: false,
          message: 'User not authenticated',
          error: 'User not authenticated',
          data: null
        };
      }
      
      if (!cartStore.cart) {
        set({ error: 'Cart is empty', isLoading: false });
        return {
          success: false,
          message: 'Cart is empty',
          error: 'Cart is empty',
          data: null
        };
      }
      
      // Get selected item IDs
      const selectedItemIds = cartStore.cart.cartItems.map(item => item.id);
      
      if (selectedItemIds.length === 0) {
        set({ error: 'No items selected for checkout', isLoading: false });
        return {
          success: false,
          message: 'No items selected for checkout',
          error: 'No items selected for checkout',
          data: null
        };
      }

      // Create checkout data using CartToOrderInput format
      const checkoutData: CartToOrderInput = {
        cartId: cartStore.cart.id,
        userId: authStore.user.id,
        phoneNumber,
        address,
        postalCode,
        paymentMethod,
        selectedCartItemIds: selectedItemIds
      };
      
      const response = await OrderService.createFromCart(checkoutData);
      
      if (response.success && response.data) {
        // Refresh orders
        await get().fetchUserOrders();
        set({ isLoading: false });
      } else {
        set({ 
          error: response.message || 'Checkout failed', 
          isLoading: false
        });
      }
      
      // Return the full API response
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Checkout failed';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      
      // Return a structured error response
      return {
        success: false,
        message: errorMessage,
        error: error,
        data: null
      };
    }
  },
  
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      // Create update data
      const updateData: UpdateOrderInput = { status };
      
      const response = await OrderService.updateOrder(orderId, updateData);
      
      if (response.success && response.data) {
        // Update the order in the local state
        const updatedOrders = get().orders.map(order => 
          order.id === orderId ? response.data! : order
        );
        
        set({ 
          orders: updatedOrders,
          currentOrder: get().currentOrder?.id === orderId ? response.data : get().currentOrder,
          isLoading: false 
        });
        
        return true;
      } else {
        set({ 
          error: response.message || `Failed to update order ${orderId}`, 
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : `Failed to update order ${orderId}`,
        isLoading: false
      });
      return false;
    }
  },
  
  cancelOrder: async (orderId: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      
      const response = await OrderService.cancelOrder(orderId);
      
      if (response.success && response.data) {
        // Update the order in the local state
        const updatedOrders = get().orders.map(order => 
          order.id === orderId ? response.data! : order
        );
        
        set({ 
          orders: updatedOrders,
          currentOrder: get().currentOrder?.id === orderId ? response.data : get().currentOrder,
          isLoading: false 
        });
        
        return true;
      } else {
        set({ 
          error: response.message || `Failed to cancel order ${orderId}`, 
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : `Failed to cancel order ${orderId}`,
        isLoading: false
      });
      return false;
    }
  }
}));