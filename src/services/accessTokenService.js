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
 * Get all access keys for a specific project
 * @param {number} projectId - The project ID to fetch access keys for
 * @returns {Promise<Object>} Response containing access keys array
 */
export const getAccessKeysByProjectId = async (projectId) => {
    const response = await axios.get(
        `${API_URL}/access-key?project_id=${projectId}`,
        {
            headers: getAuthHeaders(),
        }
    );
    return response;
};

/**
 * Delete an access key by ID
 * @param {number} accessKeyId - The access key ID to delete
 * @returns {Promise<Object>} Response from the delete operation
 */
export const deleteAccessKey = async (accessKeyId) => {
    const response = await axios.delete(
        `${API_URL}/access-key/${accessKeyId}`,
        {
            headers: getAuthHeaders(),
        }
    );
    return response;
};

/**
 * Create a new access key
 * @param {Object} accessKeyData - The access key data to create
 * @param {string} accessKeyData.description - Description of the access key
 * @param {number} accessKeyData.project_id - Project ID for the access key
 * @param {number} accessKeyData.expiration_days - Number of days until expiration
 * @param {Array<number>} accessKeyData.device_ids - Array of device IDs
 * @param {Array<string>} accessKeyData.domain_sites - Array of domain sites
 * @returns {Promise<Object>} Response from the create operation
 */
export const createAccessKey = async (accessKeyData) => {
    const response = await axios.post(
        `${API_URL}/access-key`,
        accessKeyData,
        {
            headers: getAuthHeaders(),
        }
    );
    return response;
};

export default {
    getAccessKeysByProjectId,
    deleteAccessKey,
    createAccessKey,
};
