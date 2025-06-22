import axiosInstance from "./axiosInstance";

/**
 * Payment service for handling various payment methods
 */
class PaymentService {
  /**
   * Create a VNPAY payment for an order
   * @param orderId - The ID of the order to pay
   * @returns Promise containing payment URL for redirection
   */
  async createVnpayPayment(orderId: string): Promise<string> {
    try {
      const response = await axiosInstance.post('/payment/create-vnpay-payment', { orderId });
      return response.data.paymentUrl;
    } catch (error) {
      console.error('Error creating VNPAY payment:', error);
      throw new Error('Failed to create VNPAY payment');
    }
  }

  /**
   * Check the status of a VNPAY payment
   * @param orderId - The ID of the order to check status for
   * @returns Promise containing payment status information
   */
  async checkVnpayStatus(orderId: string) {
    try {
      const response = await axiosInstance.get(`/payment/vnpay-status/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking VNPAY status:', error);
      throw new Error('Failed to check payment status');
    }
  }
}

export default new PaymentService();
