import type { AuditReport } from './audit';

/**
 * What `/api/analyze` actually returns: the audit report plus the cache key the
 * chat endpoint uses to reload it. Type-only import, so none of the crawler's
 * server dependencies reach the client bundle.
 */
export type Report = AuditReport & { auditHash?: string };
