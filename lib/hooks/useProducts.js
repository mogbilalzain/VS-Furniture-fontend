'use client';

import { useApi, usePaginatedApi } from './useApi';
import { productsAPI } from '../api';

/**
 * Hook for fetching all products (public)
 */
export const useProducts = (params = {}) => {
  return usePaginatedApi(productsAPI.getAll, params);
};

/**
 * Hook for fetching single product
 */
export const useProduct = (id, immediate = true) => {
  return useApi(() => productsAPI.getById(id), [id], immediate);
};

/**
 * Hook for admin products
 */
export const useAdminProducts = (params = {}) => {
  return usePaginatedApi(productsAPI.getAdminAll, params);
};

/**
 * Hook for product operations (create, update, delete)
 */
export const useProductOperations = () => {
  const createProduct = useApi(productsAPI.create, [], false);
  const updateProduct = useApi(productsAPI.update, [], false);
  const deleteProduct = useApi(productsAPI.delete, [], false);

  return {
    create: createProduct,
    update: updateProduct,
    delete: deleteProduct,
  };
};

export default useProducts;