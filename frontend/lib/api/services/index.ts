/**
 * API Services - Centralized exports for all API service objects
 *
 * Usage:
 *   import { authService, docService } from '@/lib/api/services';
 *
 *   await authService.login(email, password);
 *   await docService.uploadDocument(file, strategy);
 */

export { authService } from './authService';
export { docService } from './docService';

// Export error classes used across services
export { RateLimitError } from './authService';
