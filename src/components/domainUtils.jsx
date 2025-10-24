/**
 * Domain and URL utilities for multi-domain setup
 */

/**
 * Gets the current hostname
 * @returns {string} - Current hostname
 */
export function getCurrentHostname() {
  if (typeof window === 'undefined') return '';
  return window.location.hostname;
}

/**
 * Checks if we're in Base44 preview environment
 * @returns {boolean}
 */
export function isBase44Preview() {
  if (typeof window === 'undefined') return false;
  const hostname = getCurrentHostname();
  // Base44 preview domains typically include 'base44.app' or similar patterns
  return hostname.includes('.base44.app') || hostname.includes('base44.io') || hostname.includes('preview');
}

/**
 * Gets the public domain URL
 * @returns {string} - Public domain URL (e.g., https://getcontractguard.com)
 */
export function getPublicDomain() {
  const hostname = getCurrentHostname();
  
  // In development (localhost), use current origin
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return typeof window !== 'undefined' ? window.location.origin : '';
  }
  
  // In production, always use the main domain
  return 'https://getcontractguard.com';
}

/**
 * Gets the app subdomain URL
 * @returns {string} - App subdomain URL (e.g., https://app.getcontractguard.com)
 */
export function getAppDomain() {
  const hostname = getCurrentHostname();
  
  // In development (localhost), use current origin
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return typeof window !== 'undefined' ? window.location.origin : '';
  }
  
  // In production, always use the app subdomain
  return 'https://app.getcontractguard.com';
}

/**
 * Checks if we're currently on the public domain
 * @returns {boolean}
 */
export function isOnPublicDomain() {
  const hostname = getCurrentHostname();
  
  // Development check - localhost is considered "public" for testing
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return true;
  }
  
  // Production check
  return hostname === 'getcontractguard.com' || hostname === 'www.getcontractguard.com';
}

/**
 * Checks if we're currently on the app subdomain
 * @returns {boolean}
 */
export function isOnAppDomain() {
  const hostname = getCurrentHostname();
  
  // Development check
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return false;
  }
  
  // Production check
  return hostname === 'app.getcontractguard.com';
}

/**
 * Creates an absolute URL to a page on the public domain
 * @param {string} pageName - The name of the page (case-sensitive, e.g., "Landing")
 * @returns {string} - Absolute URL to the public domain
 */
export function createPublicUrl(pageName) {
  const publicDomain = getPublicDomain();
  const path = `/${pageName}`;
  return `${publicDomain}${path}`;
}

/**
 * Creates an absolute URL to a page on the app subdomain
 * @param {string} pageName - The name of the page (case-sensitive, e.g., "Dashboard")
 * @returns {string} - Absolute URL to the app subdomain
 */
export function createAppUrl(pageName) {
  const appDomain = getAppDomain();
  const path = `/${pageName}`;
  return `${appDomain}${path}`;
}

/**
 * List of page names that belong to the public website (lowercase for comparison)
 */
export const PUBLIC_PAGES = [
  'landing',
  'pricing',
  'features',
  'blog',
  'blogpost',
  'tryfree',
  'help',
  'helparticle',
  'helpcategory',
  'contact',
  'privacypolicy',
  'termsofservice',
  'refundpolicy',
  'cookiepolicy',
  '404'
];

/**
 * List of page names that belong to the app (lowercase for comparison)
 */
export const APP_PAGES = [
  'dashboard',
  'upload',
  'analysis',
  'myanalyses',
  'account',
  'billing'
];

/**
 * Pages that should be accessible on app subdomain but don't require auth
 * These pages won't be redirected
 */
export const PUBLIC_APP_PAGES = [
  'analysispreview'
];

/**
 * Checks if a given page name is a public page
 * @param {string} pageName - The name of the page
 * @returns {boolean}
 */
export function isPublicPage(pageName) {
  return PUBLIC_PAGES.includes(pageName.toLowerCase());
}

/**
 * Checks if a given page name is an app page
 * @param {string} pageName - The name of the page
 * @returns {boolean}
 */
export function isAppPage(pageName) {
  return APP_PAGES.includes(pageName.toLowerCase());
}

/**
 * Checks if a given page name is a public app page (no redirect, no auth required)
 * @param {string} pageName - The name of the page
 * @returns {boolean}
 */
export function isPublicAppPage(pageName) {
  return PUBLIC_APP_PAGES.includes(pageName.toLowerCase());
}