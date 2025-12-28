import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

/**
 * Get authorization headers for API requests
 * @returns {Object} Headers object with authorization token
 */
const getAuthHeaders = () => ({
    authorization: localStorage.getItem('auth-token'),
});

/**
 * Share Dashboard Service
 * Handles all API calls related to dashboard sharing
 */
const shareService = {
    /**
     * Get all shared dashboards for a specific project
     * @param {number} projectId - The project ID to fetch shares for
     * @returns {Promise<Object>} Response containing shares array
     */
    getSharesByProjectId: async (projectId) => {
        const response = await axios.get(
            `${API_URL}/share?project_id=${projectId}`,
            {
                headers: getAuthHeaders(),
            }
        );
        return response;
    },

    /**
     * Create a new shared dashboard link
     * @param {Object} shareData - The share data to create
     * @param {number} shareData.project_id - Project ID for the share
     * @param {Array<number>} shareData.allowed_widget_ids - Array of widget IDs to share
     * @param {string} [shareData.share_name] - Optional name for the share
     * @param {string|null} [shareData.expires_at] - Optional expiration date
     * @returns {Promise<Object>} Response from the create operation
     */
    createShare: async (shareData) => {
        const response = await axios.post(
            `${API_URL}/share`,
            shareData,
            {
                headers: getAuthHeaders(),
            }
        );
        return response;
    },

    /**
     * Update an existing shared dashboard
     * @param {Object} shareData - The share data to update
     * @param {number} shareData.share_id - Share ID to update
     * @param {Array<number>} [shareData.allowed_widget_ids] - Updated widget IDs
     * @param {string} [shareData.share_name] - Updated share name
     * @param {boolean} [shareData.is_active] - Updated active status
     * @param {string|null} [shareData.expires_at] - Updated expiration date
     * @returns {Promise<Object>} Response from the update operation
     */
    updateSharedDashboard: async (shareData) => {
        const response = await axios.put(
            `${API_URL}/share`,
            shareData,
            {
                headers: getAuthHeaders(),
            }
        );
        return response;
    },

    /**
     * Delete/revoke a shared dashboard
     * @param {number} shareId - The share ID to delete
     * @returns {Promise<Object>} Response from the delete operation
     */
    deleteSharedDashboard: async (shareId) => {
        const response = await axios.delete(
            `${API_URL}/share/${shareId}`,
            {
                headers: getAuthHeaders(),
            }
        );
        return response;
    },

    // ========== Public (No Auth) Endpoints ==========

    /**
     * Get public dashboard data by share token
     * @param {string} shareToken - The share token
     * @returns {Promise<Object>} Response containing dashboard data
     */
    getPublicDashboard: async (shareToken) => {
        const response = await axios.get(
            `${API_URL}/public/dashboard/${shareToken}`
        );
        return response;
    },

    /**
     * Get toggle widget data for public dashboard
     * @param {string} shareToken - The share token
     * @param {number} widgetId - The widget ID
     * @returns {Promise<Object>} Response containing toggle data
     */
    getPublicToggleData: async (shareToken, widgetId) => {
        const response = await axios.get(
            `${API_URL}/public/dashboard/${shareToken}/toggle/${widgetId}`
        );
        return response;
    },

    /**
     * Get gauge widget data for public dashboard
     * @param {string} shareToken - The share token
     * @param {number} widgetId - The widget ID
     * @returns {Promise<Object>} Response containing gauge data
     */
    getPublicGaugeData: async (shareToken, widgetId) => {
        const response = await axios.get(
            `${API_URL}/public/dashboard/${shareToken}/gauge/${widgetId}`
        );
        return response;
    },

    /**
     * Get chart widget data for public dashboard
     * @param {string} shareToken - The share token
     * @param {number} widgetId - The widget ID
     * @param {number} [limit] - Optional record limit
     * @returns {Promise<Object>} Response containing chart data
     */
    getPublicChartData: async (shareToken, widgetId, limit) => {
        let url = `${API_URL}/public/dashboard/${shareToken}/chart/${widgetId}`;
        if (limit) {
            url += `?limit=${limit}`;
        }
        const response = await axios.get(url);
        return response;
    },

    /**
     * Get parameter table widget data for public dashboard
     * @param {string} shareToken - The share token
     * @param {number} widgetId - The widget ID
     * @returns {Promise<Object>} Response containing table data
     */
    getPublicParameterTableData: async (shareToken, widgetId) => {
        const response = await axios.get(
            `${API_URL}/public/dashboard/${shareToken}/table/${widgetId}`
        );
        return response;
    },

    /**
     * Get full table data with pagination for public dashboard (expanded view)
     * @param {string} shareToken - The share token
     * @param {number} widgetId - The widget ID
     * @param {number} offset - Pagination offset
     * @param {number} limit - Number of records per page
     * @returns {Promise<Object>} Response containing table data and count
     */
    getPublicFullTableData: async (shareToken, widgetId, offset = 0, limit = 100) => {
        const response = await axios.get(
            `${API_URL}/public/dashboard/${shareToken}/table/${widgetId}/full?offset=${offset}&limit=${limit}`
        );
        return response;
    },

    /**
     * Get metric widget data for public dashboard
     * @param {string} shareToken - The share token
     * @param {number} widgetId - The widget ID
     * @returns {Promise<Object>} Response containing metric value and created_at
     */
    getPublicMetricData: async (shareToken, widgetId) => {
        const response = await axios.get(
            `${API_URL}/public/dashboard/${shareToken}/metric/${widgetId}`
        );
        return response;
    },

    /**
     * Generate share URL from token
     * @param {string} shareToken - The share token
     * @returns {string} Full share URL
     */
    generateShareUrl: (shareToken) => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/public/dashboard/${shareToken}`;
    },
};

export default shareService;
