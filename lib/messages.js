// Message Helper for English-only Support
// System messages in English

export const messages = {
  // Success Messages
  success: {
    categoryCreated: '🎉 Category created successfully!',
    categoryUpdated: '✅ Category updated successfully!',
    categoryDeleted: '🗑️ Category deleted successfully!',
    loginSuccess: '🎉 Login successful!'
  },

  // Error Messages
  error: {
    categoryNameExists: 'Category name already exists! Please choose a different name.',
    validationFailed: '⚠️ Please check your input data and try again.',
    authenticationExpired: 'Authentication expired. Please login again.',
    accessDenied: 'Access denied. Admin privileges required.',
    networkError: '🌐 Network error. Please check your internet connection and server status.',
    serverError: '⚠️ Server error. Sorry for the inconvenience, please try again later.',
    timeoutError: '⏱️ Request timeout. Try again or check your internet speed.',
    unknownError: '❌ An unexpected error occurred. Please try again.'
  },

  // Confirmation Messages
  confirm: {
    deleteCategory: 'Are you sure you want to delete "{name}" category?\n\nThis action cannot be undone and all related data will be deleted.',
    logout: 'Do you want to logout from the system?'
  },

  // Validation Messages
  validation: {
    nameRequired: 'Category name is required and must be less than 255 characters.',
    descriptionInvalid: 'Category description must be valid text.',
    colorInvalid: 'Category color must be a valid color code (e.g., #3d5c4d).',
    statusInvalid: 'Category status must be "active" or "inactive".'
  },

  // Form Labels
  form: {
    name: 'Category Name',
    description: 'Category Description',
    icon: 'Category Icon',
    color: 'Category Color',
    status: 'Category Status'
  }
};

// Helper function to get message by key
export const getMessage = (key, variables = {}) => {
  try {
    const keys = key.split('.');
    let message = messages;
    
    for (const k of keys) {
      message = message[k];
      if (!message) break;
    }
    
    if (!message) {
      console.warn(`Message not found for key: ${key}`);
      return key; // Fallback to key itself
    }
    
    let result = message;
    
    // Replace variables in message
    Object.keys(variables).forEach(variable => {
      result = result.replace(`{${variable}}`, variables[variable]);
    });
    
    return result;
  } catch (error) {
    console.error('Error getting message:', error);
    return key; // Fallback to key itself
  }
};

// Quick access functions
export const getSuccessMessage = (key, variables = {}) => getMessage(`success.${key}`, variables);
export const getErrorMessage = (key, variables = {}) => getMessage(`error.${key}`, variables);
export const getConfirmMessage = (key, variables = {}) => getMessage(`confirm.${key}`, variables);
export const getValidationMessage = (key, variables = {}) => getMessage(`validation.${key}`, variables);

export default messages;