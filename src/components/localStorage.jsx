/**
 * Utility functions for localStorage operations with better error handling
 */

export const localStorageUtils = {
  /**
   * Safely get an item from localStorage
   * @param {string} key - The key to retrieve
   * @returns {string|null} - The value or null if not found/error
   */
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting localStorage item '${key}':`, error);
      return null;
    }
  },

  /**
   * Safely set an item in localStorage
   * @param {string} key - The key to set
   * @param {string} value - The value to set
   * @returns {boolean} - True if successful, false otherwise
   */
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
      // Verify it was set correctly
      const verify = localStorage.getItem(key);
      if (verify !== value) {
        console.error(`Failed to set localStorage item '${key}'. Expected: ${value}, Got: ${verify}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error(`Error setting localStorage item '${key}':`, error);
      return false;
    }
  },

  /**
   * Safely remove an item from localStorage
   * @param {string} key - The key to remove
   * @returns {boolean} - True if successful, false otherwise
   */
  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage item '${key}':`, error);
      return false;
    }
  },

  /**
   * Get all keys from localStorage
   * @returns {string[]} - Array of all keys
   */
  getAllKeys() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
      }
      return keys;
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  },

  /**
   * Check if localStorage is available
   * @returns {boolean} - True if localStorage is available
   */
  isAvailable() {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.error('localStorage is not available:', error);
      return false;
    }
  },

  /**
   * Debug localStorage state
   * @returns {object} - Debug information about localStorage
   */
  debug() {
    try {
      const keys = this.getAllKeys();
      const analysisKeys = keys.filter(key => key.startsWith('analysis_'));
      const pendingKey = keys.includes('pending_save_analysis');
      
      return {
        isAvailable: this.isAvailable(),
        length: localStorage.length,
        allKeys: keys,
        analysisKeys: analysisKeys,
        hasPendingSave: pendingKey,
        pendingValue: pendingKey ? this.getItem('pending_save_analysis') : null
      };
    } catch (error) {
      console.error('Error debugging localStorage:', error);
      return {
        isAvailable: false,
        error: error.message
      };
    }
  }
};

export default localStorageUtils;