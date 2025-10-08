'use client';

import { useApi } from './useApi';
import { categoriesAPI } from '../api';

/**
 * Hook for fetching all categories
 */
export const useCategories = () => {
  return useApi(categoriesAPI.getAll);
};

/**
 * Hook for fetching single category
 */
export const useCategory = (id, immediate = true) => {
  return useApi(() => categoriesAPI.getById(id), [id], immediate);
};

/**
 * Hook for fetching products in category
 */
export const useCategoryProducts = (id, immediate = true) => {
  return useApi(() => categoriesAPI.getProducts(id), [id], immediate);
};

/**
 * Hook for category operations (create, update, delete)
 */
export const useCategoryOperations = () => {
  const createCategory = useApi(categoriesAPI.create, [], false);
  const updateCategory = useApi(categoriesAPI.update, [], false);
  const deleteCategory = useApi(categoriesAPI.delete, [], false);

  return {
    create: createCategory,
    update: updateCategory,
    delete: deleteCategory,
  };
};

export default useCategories;