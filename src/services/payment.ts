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

  /**
   * Handle payment failure by redirecting to the payment failure page
   * @param navigate - React Router's navigate function
   * @param errorDetails - Error details including message, orderId, and optional errorCode
   */
  handlePaymentFailure(
    navigate: (path: string) => void,
    errorDetails: { message: string; orderId?: string; errorCode?: string }
  ) {
    const { message, orderId, errorCode } = errorDetails;
    const queryParams = new URLSearchParams();
    
    if (message) {
      queryParams.append('message', message);
    }
    
    if (orderId) {
      queryParams.append('orderId', orderId);
    }
    
    if (errorCode) {
      queryParams.append('errorCode', errorCode);
    }
    
    navigate(`/payment/failure?${queryParams.toString()}`);
  }
  
  /**
   * Get a human-readable error message from VNPAY response code
   * @param responseCode - VNPAY response code
   * @returns Human-readable error message
   */
  getVnpayErrorMessage(responseCode: string): string {
    const errorMessages: Record<string, string> = {
      '01': 'Transaction not found or invalid request',
      '02': 'Transaction already processed',
      '03': 'The access request is suspected of fraud',
      '04': 'Invalid card/account number (Card/account has expired, incorrect card/account number or card has restricted functions)',
      '05': 'Not enough balance in the account',
      '06': 'Error contacting the bank',
      '07': 'Transaction has been made, but the transaction amount exceeds the amount set by the bank',
      '09': 'Invalid transaction ID',
      '10': 'System is under maintenance',
      '11': 'Timeout',
      '12': 'Invalid transaction',
      '13': 'Invalid transaction amount',
      '24': 'Transaction was cancelled',
      '51': 'The account balance is insufficient to make a payment',
      '65': 'Transaction count exceeded limit',
      '75': 'User entered wrong password too many times',
      '79': 'Authentication error (OTP)',
      '99': 'Other error'
    };
    
    return errorMessages[responseCode] || `Payment failed with code ${responseCode}`;
  }
}

export default new PaymentService();
