import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/common/api-response.model';
import {
  AuditLog,
  AuditLogFilter,
  PagedAuditLogResult,
  AuditFieldDiff,
  CorrelatedTransactionDiff,
} from '../models/audit-log/audit-log.model';

@Injectable({
  providedIn: 'root',
})
export class AuditLogService {
  private readonly api = inject(ApiService);

  public getAuditLogs(
    filter: AuditLogFilter
  ): Observable<ApiResponse<PagedAuditLogResult>> {
    const params: Record<string, string | number | boolean> = {
      pageNumber: filter.pageNumber,
      pageSize: filter.pageSize,
    };

    if (filter.searchTerm?.trim()) {
      params['searchTerm'] = filter.searchTerm.trim();
    }
    if (filter.fromDate) {
      params['fromDate'] = filter.fromDate;
    }
    if (filter.toDate) {
      params['toDate'] = filter.toDate;
    }
    if (filter.userId !== undefined && filter.userId !== null) {
      params['userId'] = filter.userId;
    }
    if (filter.module?.trim()) {
      params['module'] = filter.module.trim();
    }
    if (filter.action?.trim()) {
      params['action'] = filter.action.trim();
    }
    if (filter.isSuccess !== undefined && filter.isSuccess !== null) {
      params['isSuccess'] = filter.isSuccess;
    }
    if (filter.isReviewed !== undefined && filter.isReviewed !== null) {
      params['isReviewed'] = filter.isReviewed;
    }
    if (filter.sortBy?.trim()) {
      params['sortBy'] = filter.sortBy.trim();
    }
    if (filter.sortDirection?.trim()) {
      params['sortDirection'] = filter.sortDirection.trim();
    }

    return this.api.get<ApiResponse<PagedAuditLogResult>>(
      this.api.routes.auditLogs.list,
      params
    );
  }

  public getAuditLogById(id: number): Observable<ApiResponse<AuditLog>> {
    return this.api.get<ApiResponse<AuditLog>>(
      this.api.routes.auditLogs.detail(id)
    );
  }

  public acknowledgeLog(id: number): Observable<ApiResponse<boolean>> {
    return this.api.put<ApiResponse<boolean>>(
      this.api.routes.auditLogs.acknowledge(id),
      {}
    );
  }

  public acknowledgeAll(): Observable<ApiResponse<number>> {
    return this.api.put<ApiResponse<number>>(
      this.api.routes.auditLogs.acknowledgeAll,
      {}
    );
  }

  /**
   * Helper method to parse Before and After JSON strings into structured diff fields.
   */
  public parseJsonDiff(
    beforeJson?: string | null,
    afterJson?: string | null
  ): AuditFieldDiff[] {
    let beforeObj: Record<string, any> = {};
    let afterObj: Record<string, any> = {};

    if (beforeJson) {
      try {
        beforeObj = JSON.parse(beforeJson);
      } catch {
        beforeObj = { RawValue: beforeJson };
      }
    }

    if (afterJson) {
      try {
        afterObj = JSON.parse(afterJson);
      } catch {
        afterObj = { RawValue: afterJson };
      }
    }

    const allKeys = Array.from(
      new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)])
    );

    return allKeys.map((key) => {
      const oldVal = beforeObj[key] !== undefined ? String(beforeObj[key]) : null;
      const newVal = afterObj[key] !== undefined ? String(afterObj[key]) : null;
      return {
        fieldName: key,
        oldValue: oldVal,
        newValue: newVal,
        isChanged: oldVal !== newVal,
      };
    });
  }

  /**
   * Enterprise Correlated Resolver:
   * Reconstructs multi-entity transaction deltas (e.g. Delete + Create pairs sharing the same TraceId).
   */
  public computeCorrelatedDiff(
    currentLog: AuditLog | null,
    allLogs: AuditLog[]
  ): CorrelatedTransactionDiff | null {
    if (!currentLog || !currentLog.traceId || !allLogs || allLogs.length === 0) {
      return null;
    }

    const desc = currentLog.description || '';
    const match = desc.match(/(StudentAddress|StudentPhoneNumber|HostelApplication|LabBooking|Complaint)/i);
    const entityType = match ? match[1] : '';

    if (!entityType) {
      return null;
    }

    const isCurrentCreate = currentLog.action.toLowerCase() === 'create';
    const isCurrentDelete = currentLog.action.toLowerCase() === 'delete';

    if (!isCurrentCreate && !isCurrentDelete) {
      return null;
    }

    const targetAction = isCurrentCreate ? 'delete' : 'create';

    const candidates = allLogs.filter(
      (l) =>
        l.id !== currentLog.id &&
        l.action.toLowerCase() === targetAction &&
        (l.description || '').includes(entityType) &&
        (l.traceId && currentLog.traceId && l.traceId !== 'N/A'
          ? l.traceId === currentLog.traceId
          : Math.abs(new Date(l.timestamp).getTime() - new Date(currentLog.timestamp).getTime()) <= 10000)
    );

    if (candidates.length === 0) {
      return null;
    }

    // Pick candidate with closest ID and timestamp proximity to currentLog
    candidates.sort((a, b) => Math.abs(a.id - currentLog.id) - Math.abs(b.id - currentLog.id));
    const sibling = candidates[0];

    const deleteLog = isCurrentCreate ? sibling : currentLog;
    const createLog = isCurrentCreate ? currentLog : sibling;

    const diffs = this.parseJsonDiff(
      deleteLog.beforeValuesJson,
      createLog.afterValuesJson
    ).filter((d) => d.fieldName.toLowerCase() !== 'id');

    const changedFields = diffs.filter((d) => d.isChanged);
    const changedSummary =
      changedFields.length > 0
        ? changedFields
            .map((f) => `${f.fieldName}: ${f.oldValue ?? 'null'} → ${f.newValue ?? 'null'}`)
            .join(', ')
        : 'Fields identical';

    return {
      hasCorrelation: true,
      siblingLogId: sibling.id,
      siblingAction: sibling.action,
      transactionTraceId: currentLog.traceId,
      entityName: entityType,
      summaryText: `Atomic ${entityType} replacement: ${changedSummary}`,
      diffs,
    };
  }
}
