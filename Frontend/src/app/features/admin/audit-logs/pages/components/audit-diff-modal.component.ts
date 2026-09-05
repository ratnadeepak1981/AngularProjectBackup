import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AuditLog,
  AuditFieldDiff,
  CorrelatedTransactionDiff,
} from '../../../../../core/models/audit-log/audit-log.model';
import { AuditLogService } from '../../../../../core/services/audit-log.service';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge.component';
import { ActionButtonComponent } from '../../../../../shared/components/action-button/action-button.component';

@Component({
  selector: 'app-audit-diff-modal',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, ActionButtonComponent],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
          (click)="onClose()"
        ></div>

        <!-- Dialog Container -->
        <div
          class="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 z-10 flex flex-col max-h-[90vh]"
        >
          <!-- Header -->
          <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg font-bold border border-blue-200 dark:border-blue-800">
                📋
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Audit Record Details & State Diff
                  <span class="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    #{{ log()?.id }}
                  </span>
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Detailed snapshot of operation metadata, client fingerprint, and entity values.
                </p>
              </div>
            </div>

            <button
              (click)="onClose()"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>

          <!-- Body Content (Scrollable) -->
          <div class="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            @if (log(); as item) {
              <!-- Metadata Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div>
                  <span class="text-[11px] font-bold uppercase text-slate-400 block mb-1">Module / Area</span>
                  <span class="font-semibold text-slate-800 dark:text-slate-200 px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-[11px]">
                    {{ item.module }}
                  </span>
                </div>
                <div>
                  <span class="text-[11px] font-bold uppercase text-slate-400 block mb-1">Action Type</span>
                  <span class="font-semibold text-blue-600 dark:text-blue-400">
                    {{ item.action }}
                  </span>
                </div>
                <div>
                  <span class="text-[11px] font-bold uppercase text-slate-400 block mb-1">Outcome Status</span>
                  <app-status-badge
                    [status]="item.isSuccess ? 'Success' : 'Failed'"
                    [variant]="item.isSuccess ? 'success' : 'danger'"
                    size="sm"
                  ></app-status-badge>
                </div>
                <div>
                  <span class="text-[11px] font-bold uppercase text-slate-400 block mb-1">Timestamp (UTC)</span>
                  <span class="font-mono text-slate-700 dark:text-slate-300">
                    {{ item.timestamp | date: 'yyyy-MM-dd HH:mm:ss' }}
                  </span>
                </div>

                <div>
                  <span class="text-[11px] font-bold uppercase text-slate-400 block mb-1">Initiator / User</span>
                  <span class="font-medium text-slate-800 dark:text-slate-200 truncate block">
                    {{ item.userDisplayName || 'System Anonymous' }}
                  </span>
                </div>
                <div>
                  <span class="text-[11px] font-bold uppercase text-slate-400 block mb-1">Entity Reference</span>
                  <span class="font-mono text-slate-700 dark:text-slate-300">
                    {{ item.entityId || 'N/A' }}
                  </span>
                </div>
                <div>
                  <span class="text-[11px] font-bold uppercase text-slate-400 block mb-1">Client IP Address</span>
                  <span class="font-mono text-slate-700 dark:text-slate-300">
                    {{ item.ipAddress || 'Unknown' }}
                  </span>
                </div>
                <div>
                  <span class="text-[11px] font-bold uppercase text-slate-400 block mb-1">Trace / Correlation ID</span>
                  <span class="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate block" [title]="item.traceId || ''">
                    {{ item.traceId || 'N/A' }}
                  </span>
                </div>
              </div>

              <!-- Action Description Box -->
              <div class="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                <span class="text-[11px] font-bold uppercase text-blue-600 dark:text-blue-400 block mb-1">Action Description</span>
                <p class="text-slate-800 dark:text-slate-200 font-medium">
                  {{ item.description }}
                </p>
              </div>

              <!-- Correlated Transaction Highlight (If applicable) -->
              @if (correlated(); as corr) {
                <div class="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-2.5">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-600 text-white">
                        🔗 Correlated Transaction
                      </span>
                      <span class="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                        Synthesized with Sibling Audit #{{ corr.siblingLogId }} ({{ corr.siblingAction }})
                      </span>
                    </div>
                    <span class="text-[10px] font-mono text-slate-500">
                      Trace: {{ corr.transactionTraceId }}
                    </span>
                  </div>

                  <p class="text-indigo-950 dark:text-indigo-200 text-xs font-medium">
                    {{ corr.summaryText }}
                  </p>

                  <!-- View Mode Switcher -->
                  <div class="flex items-center gap-2 pt-1 border-t border-indigo-200/60 dark:border-indigo-800/40">
                    <span class="text-[11px] font-semibold text-slate-500">View Mode:</span>
                    <button
                      type="button"
                      (click)="viewMode.set('smart')"
                      [class.bg-indigo-600]="viewMode() === 'smart'"
                      [class.text-white]="viewMode() === 'smart'"
                      [class.bg-white]="viewMode() !== 'smart'"
                      [class.text-slate-700]="viewMode() !== 'smart'"
                      [class.dark:bg-slate-800]="viewMode() !== 'smart'"
                      [class.dark:text-slate-200]="viewMode() !== 'smart'"
                      class="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-indigo-300 dark:border-indigo-700 transition-colors cursor-pointer"
                    >
                      ✨ Correlated Business Diff
                    </button>
                    <button
                      type="button"
                      (click)="viewMode.set('raw')"
                      [class.bg-indigo-600]="viewMode() === 'raw'"
                      [class.text-white]="viewMode() === 'raw'"
                      [class.bg-white]="viewMode() !== 'raw'"
                      [class.text-slate-700]="viewMode() !== 'raw'"
                      [class.dark:bg-slate-800]="viewMode() !== 'raw'"
                      [class.dark:text-slate-200]="viewMode() !== 'raw'"
                      class="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-indigo-300 dark:border-indigo-700 transition-colors cursor-pointer"
                    >
                      📋 Raw Persistence Ledger
                    </button>
                  </div>
                </div>
              }

              <!-- State Changes & Field Diffs Section -->
              <div class="space-y-3">
                <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span>🔄</span>
                    <span>
                      {{ viewMode() === 'smart' && correlated() ? 'Correlated State Comparison (Before vs After)' : 'Physical Database Snapshot (Before vs After)' }}
                    </span>
                  </h4>
                  <span class="text-[11px] text-slate-500">
                    {{ activeDiffFields().length }} field(s) captured
                  </span>
                </div>

                @if (activeDiffFields().length > 0) {
                  <div class="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <table class="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase">
                          <th class="py-2.5 px-4 font-semibold w-1/4">Field Property</th>
                          <th class="py-2.5 px-4 font-semibold w-3/8 text-rose-600 dark:text-rose-400">Previous Value (Before)</th>
                          <th class="py-2.5 px-4 font-semibold w-3/8 text-emerald-600 dark:text-emerald-400">Current Value (After)</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                        @for (diff of activeDiffFields(); track diff.fieldName) {
                          <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors" [class.bg-amber-500/5]="diff.isChanged">
                            <td class="py-2 px-4 font-semibold text-slate-800 dark:text-slate-200">
                              {{ diff.fieldName }}
                              @if (diff.isChanged) {
                                <span class="ml-1 px-1.5 py-0.5 rounded text-[9px] font-sans font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">MODIFIED</span>
                              }
                            </td>
                            <td class="py-2 px-4 text-slate-600 dark:text-slate-400 break-all" [class.line-through]="diff.isChanged && diff.oldValue">
                              @if (diff.oldValue !== null) {
                                <span [class.text-rose-600]="diff.isChanged" [class.dark:text-rose-400]="diff.isChanged">
                                  {{ diff.oldValue }}
                                </span>
                              } @else {
                                <span class="text-slate-400 italic">null</span>
                              }
                            </td>
                            <td class="py-2 px-4 text-slate-800 dark:text-slate-200 break-all">
                              @if (diff.newValue !== null) {
                                <span [class.text-emerald-600]="diff.isChanged" [class.dark:text-emerald-400]="diff.isChanged" [class.font-bold]="diff.isChanged">
                                  {{ diff.newValue }}
                                </span>
                              } @else {
                                <span class="text-slate-400 italic">null</span>
                              }
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                } @else {
                  <div class="p-6 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500">
                    <p class="font-medium">No entity field state payload was attached to this audit record.</p>
                    <p class="text-[11px] text-slate-400 mt-1">Direct authentication and security events log transaction metadata only.</p>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span class="text-[11px] text-slate-500">
              🔒 Append-Only Immutable Record • Tamper-Evident System
            </span>
            <app-action-button
              label="Close"
              icon="✕"
              variant="secondary"
              size="sm"
              (btnClick)="onClose()"
            ></app-action-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AuditDiffModalComponent {
  private readonly auditService = inject(AuditLogService);

  isOpen = input<boolean>(false);
  log = input<AuditLog | null>(null);
  allLogs = input<AuditLog[]>([]);
  close = output<void>();

  public readonly viewMode = signal<'smart' | 'raw'>('smart');

  public readonly correlated = computed<CorrelatedTransactionDiff | null>(() => {
    return this.auditService.computeCorrelatedDiff(this.log(), this.allLogs());
  });

  public readonly rawDiffFields = computed<AuditFieldDiff[]>(() => {
    const item = this.log();
    if (!item) return [];
    return this.auditService.parseJsonDiff(
      item.beforeValuesJson,
      item.afterValuesJson
    );
  });

  public readonly activeDiffFields = computed<AuditFieldDiff[]>(() => {
    const corr = this.correlated();
    if (this.viewMode() === 'smart' && corr && corr.diffs.length > 0) {
      return corr.diffs;
    }
    return this.rawDiffFields();
  });

  onClose(): void {
    this.close.emit();
  }
}
