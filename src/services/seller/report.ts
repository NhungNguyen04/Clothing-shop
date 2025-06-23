import axiosInstance from "../axiosInstance";

// Interfaces for API responses
export interface DashboardSummary {
  totalProducts: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  totalOrders: number;
  averageRating: number;
  lastUpdated: Date;
}

export interface ProductsReportMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductsReport {
  products: any[];
  meta: ProductsReportMeta;
}

export interface InventoryReportMeta extends ProductsReportMeta {
  outOfStockCount: number;
  lowStockCount: number;
}

export interface InventoryReport {
  products: any[];
  meta: InventoryReportMeta;
}

export interface RevenuePeriod {
  period: string;
  revenue: number;
}

export interface RevenueReport {
  startDate: string;
  endDate: string;
  totalRevenue: number;
  groupBy: 'day' | 'week' | 'month';
  revenueByPeriod: RevenuePeriod[];
  topSellingProducts: any[];
}

export interface OrdersReportMeta extends ProductsReportMeta {}

export interface OrdersReport {
  orders: any[];
  ordersByStatus: Record<string, number>;
  meta: OrdersReportMeta;
}

export interface TopProductsReport {
  topByRevenue: any[];
  topRated: any[];
  recentProducts: any[];
}

// Error handling wrapper
const apiRequest = async <T>(request: Promise<any>): Promise<T> => {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Seller Report API Service
export interface InventoryReportParams {
  sellerId: string;
  page?: number;
  limit?: number;
  lowStockOnly?: boolean;
  timeRange?: 'week' | 'month' | 'year' | 'all';
}

class SellerReportService {
  /**
   * Get dashboard summary for a seller
   * @param sellerId Seller ID
   * @returns Dashboard summary data
   */
  async getDashboardSummary(sellerId: string): Promise<DashboardSummary> {
    return apiRequest<DashboardSummary>(
      axiosInstance.get(`/seller-report/${sellerId}/dashboard-summary`)
    );
  }

  /**
   * Get products report for a seller
   * @param sellerId Seller ID
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 10)
   * @returns Products report data
   */
  async getProductsReport(
    sellerId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ProductsReport> {
    return apiRequest<ProductsReport>(
      axiosInstance.get(`/seller-report/${sellerId}/products`, {
        params: { page, limit },
      })
    );
  }

  /**
   * Get inventory report for a seller
   * @param sellerId Seller ID
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 10)
   * @param lowStockOnly Filter for low stock items only (default: false)
   * @returns Inventory report data
   */
  async getInventoryReport(
    sellerId: string,
    page: number = 1,
    limit: number = 10,
    lowStockOnly: boolean = false
  ): Promise<InventoryReport> {
    return apiRequest<InventoryReport>(
      axiosInstance.get(`/seller-report/${sellerId}/inventory`, {
        params: { page, limit, lowStock: lowStockOnly },
      })
    );
  }

  /**
   * Get revenue report for a seller
   * @param sellerId Seller ID
   * @param startDate Start date (YYYY-MM-DD) - defaults to 30 days ago
   * @param endDate End date (YYYY-MM-DD) - defaults to today
   * @param groupBy Group revenue by period (day, week, month) - defaults to day
   * @returns Revenue report data
   */
  async getRevenueReport(
    sellerId: string,
    startDate?: string,
    endDate?: string,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<RevenueReport> {
    return apiRequest<RevenueReport>(
      axiosInstance.get(`/seller-report/${sellerId}/revenue`, {
        params: { startDate, endDate, groupBy },
      })
    );
  }

  /**
   * Get orders report for a seller
   * @param sellerId Seller ID
   * @param status Filter by order status
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 10)
   * @returns Orders report data
   */
  async getOrdersReport(
    sellerId: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<OrdersReport> {
    return apiRequest<OrdersReport>(
      axiosInstance.get(`/seller-report/${sellerId}/orders`, {
        params: { status, page, limit },
      })
    );
  }

  /**
   * Get top products for a seller
   * @param sellerId Seller ID
   * @param limit Number of products to return (default: 5)
   * @returns Top products report data
   */
  async getTopProducts(
    sellerId: string,
    limit: number = 5
  ): Promise<TopProductsReport> {
    return apiRequest<TopProductsReport>(
      axiosInstance.get(`/seller-report/${sellerId}/top-products`, {
        params: { limit },
      })
    );
  }

  /**
   * Helper function to get data for dashboard widgets
   * @param sellerId Seller ID
   * @returns Data formatted for dashboard widgets
   */
  async getDashboardWidgetData(sellerId: string) {
    const summary = await this.getDashboardSummary(sellerId);
    const revenueData = await this.getRevenueReport(sellerId, undefined, undefined, 'day');
    
    return {
      summary,
      revenueChart: revenueData.revenueByPeriod,
      topProducts: revenueData.topSellingProducts,
    };
  }

  /**
   * Get inventory report for a seller with time range filter
   * @param params Inventory report parameters
   * @returns Inventory report data
   */
  async getInventoryReportWithTimeRange(params: InventoryReportParams): Promise<InventoryReport> {
    const { sellerId, page = 1, limit = 10, lowStockOnly = false, timeRange = 'all' } = params;
    
    // Calculate start date based on time range
    let startDate: string | undefined;
    if (timeRange !== 'all') {
      const now = new Date();
      if (timeRange === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
      } else if (timeRange === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        startDate = monthAgo.toISOString().split('T')[0];
      } else if (timeRange === 'year') {
        const yearAgo = new Date(now);
        yearAgo.setFullYear(now.getFullYear() - 1);
        startDate = yearAgo.toISOString().split('T')[0];
      }
    }

    return apiRequest<InventoryReport>(
      axiosInstance.get(`/seller-report/${sellerId}/inventory`, {
        params: { 
          page, 
          limit, 
          lowStock: lowStockOnly,
          startDate,
          endDate: new Date().toISOString().split('T')[0]
        },
      })
    );
  }

  // Add method to get inventory history for a specific product
  async getProductInventoryHistory(
    sellerId: string,
    productId: string,
    timeRange: 'week' | 'month' | 'year' = 'week'
  ) {
    return apiRequest(
      axiosInstance.get(`/seller-report/${sellerId}/products/${productId}/inventory-history`, {
        params: { timeRange },
      })
    );
  }
}

export const sellerReportService = new SellerReportService();
export default sellerReportService;
