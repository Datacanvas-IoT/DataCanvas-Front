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
 * Access Token Service
 * Handles all API calls related to access tokens
 */
const accessTokenService = {
    /**
     * Get all access keys for a specific project
     * @param {number} projectId - The project ID to fetch access keys for
     * @returns {Promise<Object>} Response containing access keys array
     */
    getAccessKeysByProjectId: async (projectId) => {
        const response = await axios.get(
            `${API_URL}/access-key?project_id=${projectId}`,
            {
                headers: getAuthHeaders(),
            }
        );
        return response;
    },

    /**
     * Delete an access key by ID
     * @param {number} accessKeyId - The access key ID to delete
     * @returns {Promise<Object>} Response from the delete operation
     */
    deleteAccessKey: async (accessKeyId) => {
        const response = await axios.delete(
            `${API_URL}/access-key/${accessKeyId}`,
            {
                headers: getAuthHeaders(),
            }
        );
        return response;
    },

    /**
     * Get all devices for a specific project
     * @param {number} projectId - The project ID to fetch devices for
     * @returns {Promise<Object>} Response containing devices array
     */
    getDevicesByProjectId: async (projectId) => {
        const response = await axios.get(
            `${API_URL}/device?project_id=${projectId}`,
            {
                headers: getAuthHeaders(),
            }
        );
        return response;
    },

    /**
     * Create a new access key
     * @param {Object} accessKeyData - The access key data to create
     * @param {number} accessKeyData.project_id - Project ID for the access key
     * @param {Array<string>} accessKeyData.domain_name_array - Array of domain names
     * @param {Array<number>} accessKeyData.device_id_array - Array of device IDs
     * @param {number} accessKeyData.valid_duration_for_access_key - Number of days until expiration
     * @returns {Promise<Object>} Response from the create operation
     */
    createAccessKey: async (accessKeyData) => {
        const response = await axios.post(
            `${API_URL}/access-key`,
            accessKeyData,
            {
                headers: getAuthHeaders(),
            }
        );
        return response;
    },
};

export default accessTokenService;
