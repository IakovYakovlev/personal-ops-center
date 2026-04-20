/**
 * API Services - Centralized exports for all API service objects
 *
 * Usage:
 *   import { authService, docService, neuralAssistantService } from '@/lib/api/services';
 *
 *   await authService.login(email, password);
 *   await docService.uploadDocument(file, strategy);
 */

export { authService } from './auth-service';
export { docService } from './doc-service';
export { neuralAssistantService } from './neural-assistant-service';

// Export error classes used across services
export { RateLimitError } from './auth-service';
