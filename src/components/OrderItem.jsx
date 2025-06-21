import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { OrderService } from '../services/order';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';

const OrderCard = ({ order, onPress, onCancel, onCancelSuccess }) => {
  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#FFC107';
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
  // Get first product image and name to display
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
  const handleCancelOrder = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes", 
          style: "destructive",
          onPress: async () => {
            try {
              const response = await OrderService.cancelOrder(order.id);
              if (response.success) {
                Alert.alert("Success", "Order cancelled successfully");
                if (onCancelSuccess) {
                  onCancelSuccess(order.id);
                }
              } else {
                Alert.alert("Error", response.message || "Failed to cancel order");
              }
            } catch (error) {
              Alert.alert("Error", "An error occurred while cancelling the order");
              console.error("Cancel order error:", error);
            }
          } 
        }
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.orderId}>Order #{order.id.slice(-6)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>      <View style={styles.content}>
        <View style={styles.imageContainer}>
          {getFirstProductImage() ? (
            <Image 
              source={{ uri: getFirstProductImage() }} 
              style={styles.image} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="cube-outline" size={24} color="#ccc" />
            </View>
          )}
          
          {order.orderItems && order.orderItems.length > 1 && (
            <View style={styles.itemCountBadge}>
              <Text style={styles.itemCountText}>+{order.orderItems.length - 1}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.details}>          <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
          <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">
            {getProductName()}
          </Text>
          <Text style={styles.items}>
            {order.orderItems.length > 1 
              ? `${order.orderItems.length} items` 
              : `${order.orderItems.length} item`}
          </Text>
          <Text style={styles.price}>${order.totalPrice.toFixed(2)}</Text>
        </View>
      </View>      {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
          <Ionicons name="close-circle-outline" size={16} color="#fff" />
          <Text style={styles.cancelButtonText}>Cancel Order</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.detailsButton} onPress={onPress}>
          <Text style={styles.detailsButtonText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color="#2e64e5" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },  content: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCountBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#2e64e5',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  itemCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },  items: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
    maxWidth: '90%',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  cancelButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButtonText: {
    color: '#2e64e5',
    marginRight: 8,
    fontWeight: '600',
  },
});

OrderCard.propTypes = {
  order: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  onCancelSuccess: PropTypes.func
};

OrderCard.defaultProps = {
  onCancel: null,
  onCancelSuccess: () => {}
};

export default OrderCard;
