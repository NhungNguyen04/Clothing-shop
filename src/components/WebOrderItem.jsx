import React from 'react';
import PropTypes from 'prop-types';
import { OrderService } from '../services/order';
import { toast } from 'react-toastify';

const WebOrderItem = ({ order, onPress, onCancelSuccess }) => {
  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#FFC107';
      case 'PROCESSING': return '#2196F3';
      case 'SHIPPED': return '#9C27B0';
      case 'DELIVERED': return '#4CAF50';
      case 'CANCELLED': return '#F44336';
      default: return '#757575';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get first product image to display
  const getFirstProductImage = () => {
    if (order.orderItems && order.orderItems.length > 0) {
      const firstItem = order.orderItems[0];
      if (firstItem.sizeStock?.product?.image && firstItem.sizeStock.product.image.length > 0) {
        return firstItem.sizeStock.product.image[0];
      }
    }
    return null;
  };
  
  // Get product name
  const getProductName = () => {
    if (order.orderItems && order.orderItems.length > 0) {
      const firstItem = order.orderItems[0];
      if (firstItem.sizeStock?.product?.name) {
        return firstItem.sizeStock.product.name;
      }
    }
    return "Unknown Product";
  };
  
  // Handle order cancellation
  const handleCancelOrder = async () => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        const response = await OrderService.cancelOrder(order.id);
        if (response.success) {
          toast.success("Order cancelled successfully");
          if (onCancelSuccess) {
            onCancelSuccess(order.id);
          }
        } else {
          toast.error(response.message || "Failed to cancel order");
        }
      } catch (error) {
        toast.error("An error occurred while cancelling the order");
        console.error("Cancel order error:", error);
      }
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="font-medium">Order #{order.id.slice(-6)}</div>
        <div 
          className="px-3 py-1 rounded-full text-xs font-semibold" 
          style={{ backgroundColor: getStatusColor(order.status), color: 'white' }}
        >
          {order.status}
        </div>
      </div>
      
      <div className="p-4 flex">
        <div className="relative mr-4">
          {getFirstProductImage() ? (
            <img 
              src={getFirstProductImage()} 
              alt="Product" 
              className="w-20 h-20 object-cover rounded-md"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}
          
          {order.orderItems && order.orderItems.length > 1 && (
            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
              +{order.orderItems.length - 1}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
          <div className="font-medium text-gray-800 truncate max-w-xs">{getProductName()}</div>
          <div className="text-sm text-gray-600">
            {order.orderItems.length > 1 
              ? `${order.orderItems.length} items` 
              : `${order.orderItems.length} item`}
          </div>
          <div className="font-semibold">${Number(order.totalPrice).toFixed(2)}</div>
        </div>
      </div>
      
      <div className="flex justify-between p-4 border-t">
        {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
          <button 
            onClick={handleCancelOrder}
            className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 text-sm"
          >
            Cancel Order
          </button>
        )}
        <button 
          onClick={onPress}
          className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 text-sm ml-auto"
        >
          Track Order
        </button>
      </div>
    </div>
  );
};

WebOrderItem.propTypes = {
  order: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
  onCancelSuccess: PropTypes.func
};

WebOrderItem.defaultProps = {
  onCancelSuccess: () => {}
};

export default WebOrderItem;
