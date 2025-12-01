/**
 * API Service for Malawi Water Point Inventory
 * Handles all communication with the NestJS backend.
 */

const API_BASE = 'http://localhost:3000/api';

const ApiService = {
    /**
     * Fetch all water points.
     * @returns {Promise<Array>} List of water points or empty array on error.
     */
    async getWaterPoints() {
        try {
            const response = await fetch(`${API_BASE}/water-points`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching water points:', error);
            // Return empty array to prevent app crash, UI will show error state if needed
            return [];
        }
    },

    /**
     * Fetch nearest water points to a location.
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Promise<Array>} List of 5 nearest points.
     */
    async getNearest(lat, lon) {
        try {
            const response = await fetch(`${API_BASE}/nearest?lat=${lat}&lon=${lon}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching nearest points:', error);
            return [];
        }
    },

    /**
     * Fetch population within a buffer radius.
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {number} radius - Radius in meters (default 5000)
     * @returns {Promise<Object>} Object containing population count.
     */
    async getPopInBuffer(lat, lon, radius = 5000) {
        try {
            const response = await fetch(`${API_BASE}/pop-in-buffer?lat=${lat}&lon=${lon}&radius=${radius}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching population buffer:', error);
            return { population: 0 }; // Fallback
        }
    },

    /**
     * Fetch dashboard statistics.
     * @returns {Promise<Object>} Stats object.
     */
    async getStats() {
        try {
            const response = await fetch(`${API_BASE}/stats`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching stats:', error);
            return null;
        }
    },

    /**
     * Search for a location using Nominatim (OpenStreetMap).
     * Biased towards Malawi.
     * @param {string} query - Search query
     * @returns {Promise<Array>} List of search results.
     */
    async searchLocation(query) {
        try {
            // viewbox for Malawi roughly: 32.6,-17.1,35.9,-9.3
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=32.6,-17.1,35.9,-9.3&bounded=1`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Nominatim error');
            return await response.json();
        } catch (error) {
            console.error('Error searching location:', error);
            return [];
        }
    }
};

// Expose to global scope
window.ApiService = ApiService;
