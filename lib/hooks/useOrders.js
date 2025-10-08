'use client';

import { useApi, usePaginatedApi } from './useApi';
import { ordersAPI } from '../api';

/**
 * Hook for creating orders
 */
export const useCreateOrder = () => {
  return useApi(ordersAPI.create, [], false);
};

/**
 * Hook for fetching all orders (admin)
 */
export const useOrders = (params = {}) => {
  return usePaginatedApi(ordersAPI.getAll, params);
};

/**
 * Hook for fetching single order
 */
export const useOrder = (id, immediate = true) => {
  return useApi(() => ordersAPI.getById(id), [id], immediate);
};

/**
 * Hook for updating order status
 */
export const useUpdateOrderStatus = () => {
  return useApi(ordersAPI.updateStatus, [], false);
};

/**
 * Hook for order statistics
 */
export const useOrderStats = () => {
  return useApi(ordersAPI.getStats);
};

export default useOrders;