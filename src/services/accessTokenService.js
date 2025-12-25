import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

/**
 * Get authorization headers for API requests
 * @returns {Object} Headers object with authorization token
 */
const getAuthHeaders = () => {
    const token = localStorage.getItem('auth-token');
    if (!token) return {};
    const bearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    // Send both common header casings to maximize backend compatibility
    return {
        authorization: token,
        Authorization: bearer,
    };
};

/**
 * Access Token Service
 * Handles all API calls related to access tokens
 */
const accessTokenService = {
    /**
     * Get a single access key by ID
     * @param {number} accessKeyId - The access key ID to fetch
     * @returns {Promise<Object>} Response containing access key details
     */
    getAccessKeyById: async (accessKeyId) => {
        const headers = { headers: getAuthHeaders() };
        const url = `${API_URL}/access-keys/${accessKeyId}`;
        return await axios.get(url, headers);
    },
    /**
     * Get all access keys for a specific project
     * @param {number} projectId - The project ID to fetch access keys for
     * @returns {Promise<Object>} Response containing access keys array
     */
    getAccessKeysByProjectId: async (projectId) => {
        const response = await axios.get(
            `${API_URL}/access-keys?project_id=${projectId}`,
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
            `${API_URL}/access-keys/${accessKeyId}`,
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
            `${API_URL}/access-keys`,
            accessKeyData,
            {
                headers: getAuthHeaders(),
            }
        );
        return response;
    },

    /**
     * Update an existing access key
     * @param {number} accessKeyId - The access key ID to update
     * @param {Object} updateData - The data to update
     * @param {string} [updateData.access_key_name] - New name for the access key
     * @param {Array<string>} [updateData.domain_name_array] - Array of domain names
     * @param {Array<number>} [updateData.device_id_array] - Array of device IDs
     * @returns {Promise<Object>} Response from the update operation
     */
    updateAccessKey: async (accessKeyId, updateData) => {
        const response = await axios.put(
            `${API_URL}/access-keys/${accessKeyId}`,
            updateData,
            {
                headers: getAuthHeaders(),
            }
        );
        return response;
    },
};

export default accessTokenService;
