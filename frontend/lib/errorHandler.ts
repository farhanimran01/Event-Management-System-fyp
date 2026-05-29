/**
 * Extract error message from various error response formats
 * Ensures we always display the real backend error message
 */
export const getErrorMessage = (error: any): string => {
    // Check if error object exists
    if (!error) {
        return 'An unexpected error occurred. Please try again.';
    }

    // Axios error response
    if (error.response) {
        const response = error.response.data;

        // Priority 1: error field (our backend standard)
        if (response.error) {
            return response.error;
        }

        // Priority 2: message field
        if (response.message) {
            return response.message;
        }

        // Priority 3: errors array (validation errors)
        if (response.errors && Array.isArray(response.errors)) {
            return response.errors.map((e: any) => e.message || e).join('. ');
        }

        // Priority 4: Generic status message
        if (error.response.status) {
            const status = error.response.status;
            switch (status) {
                case 400:
                    return 'Invalid request. Please check your input and try again.';
                case 401:
                    return 'Authentication required. Please log in.';
                case 403:
                    return 'You do not have permission to perform this action.';
                case 404:
                    return 'The requested resource was not found.';
                case 409:
                    return 'This resource already exists. Please use a different value.';
                case 500:
                    return 'Server error. Please try again later.';
                case 503:
                    return 'Service temporarily unavailable. Please try again later.';
                default:
                    return `An error occurred (Status: ${status}). Please try again.`;
            }
        }
    }

    // Network error
    if (error.request && !error.response) {
        return 'Network error. Please check your connection and try again.';
    }

    // Error message property
    if (error.message) {
        return error.message;
    }

    // String error
    if (typeof error === 'string') {
        return error;
    }

    // Fallback
    return 'An unexpected error occurred. Please try again.';
};

/**
 * Log error to console with context (development only)
 */
export const logError = (context: string, error: any, additionalData?: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.group(`🔴 Error in ${context}`);
        console.error('Error:', error);
        if (error.response) {
            console.error('Response Data:', error.response.data);
            console.error('Response Status:', error.response.status);
        }
        if (additionalData) {
            console.error('Additional Data:', additionalData);
        }
        console.groupEnd();
    }
};

/**
 * Display error toast/alert to user
 * You can integrate with a toast library here
 */
export const showError = (error: any, context?: string) => {
    const message = getErrorMessage(error);

    if (context && process.env.NODE_ENV === 'development') {
        logError(context, error);
    }

    // For now, using alert. You can replace with toast notification
    alert(message);

    return message;
};
