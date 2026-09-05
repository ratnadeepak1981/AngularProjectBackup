export interface AuditLog {
  id: number;
  userId?: number | null;
  userDisplayName?: string | null;
  action: string;
  module: string;
  entityId?: string | null;
  timestamp: string;
  isSuccess: boolean;
  isReviewed?: boolean;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  ipAddress?: string | null;
  traceId?: string | null;
  description: string;
  beforeValuesJson?: string | null;
  afterValuesJson?: string | null;
}

export interface AuditLogFilter {
  searchTerm?: string;
  fromDate?: string;
  toDate?: string;
  userId?: number;
  module?: string;
  action?: string;
  isSuccess?: boolean;
  isReviewed?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber: number;
  pageSize: number;
}

export interface PagedAuditLogResult {
  items: AuditLog[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditFieldDiff {
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  isChanged: boolean;
}

export interface CorrelatedTransactionDiff {
  hasCorrelation: boolean;
  siblingLogId?: number;
  siblingAction?: string;
  transactionTraceId?: string;
  entityName?: string;
  summaryText?: string;
  diffs: AuditFieldDiff[];
}
