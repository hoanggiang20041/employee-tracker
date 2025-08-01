// Configuration file for Employee Tracker
const CONFIG = {
  // Server configuration - Thay đổi IP này thành IP máy bạn
  SERVER_URL: 'http://192.168.1.100:3000', // Thay đổi IP này!
  
  // Extension configuration
  EXTENSION_NAME: 'Employee Activity Tracker',
  VERSION: '1.0',
  
  // Tracking configuration
  TRACKING_INTERVAL: 5000, // 5 seconds
  COMMENT_DELAY: 500, // 500ms delay for comment detection
  
  // UI configuration
  TIMER_UPDATE_INTERVAL: 1000, // 1 second
  AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
  
  // Selectors for Facebook comment buttons
  FACEBOOK_SUBMIT_SELECTORS: [
    '#focused-state-composer-submit > span > div > i',
    '[data-testid="composer-post-button"]',
    '[aria-label="Đăng"]',
    '[aria-label="Post"]',
    'button[type="submit"]'
  ]
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} 