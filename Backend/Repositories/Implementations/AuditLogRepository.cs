using System;
using System.Linq;
using System.Threading.Tasks;
using CampusServicesPortal.Data;
using CampusServicesPortal.DTOs.Requests.AuditLogs;
using CampusServicesPortal.DTOs.Responses.AuditLogs;
using CampusServicesPortal.Models;
using CampusServicesPortal.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CampusServicesPortal.Repositories.Implementations
{
    public class AuditLogRepository : IAuditLogRepository
    {
        private readonly AppDbContext _context;

        public AuditLogRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddLogAsync(AuditLog log)
        {
            await _context.AuditLogs.AddAsync(log);
            await _context.SaveChangesAsync();
        }

        public async Task<AuditLog?> GetAuditLogByIdAsync(long id)
        {
            return await _context.AuditLogs
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<PagedAuditLogResultDto> GetAuditLogsAsync(AuditLogFilterDto filter)
        {
            var query = _context.AuditLogs.AsNoTracking().AsQueryable();

            // 1. Search term (Search across Description, UserDisplayName, EntityId, IpAddress, Action, Module)
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var search = filter.SearchTerm.Trim();
                query = query.Where(a =>
                    a.Description.Contains(search) ||
                    (a.UserDisplayName != null && a.UserDisplayName.Contains(search)) ||
                    (a.EntityId != null && a.EntityId.Contains(search)) ||
                    (a.IpAddress != null && a.IpAddress.Contains(search)) ||
                    a.Action.Contains(search) ||
                    a.Module.Contains(search));
            }

            // 2. Date Range filters
            if (filter.FromDate.HasValue)
            {
                var fromUtc = filter.FromDate.Value.ToUniversalTime();
                query = query.Where(a => a.Timestamp >= fromUtc);
            }

            if (filter.ToDate.HasValue)
            {
                var toUtc = filter.ToDate.Value.ToUniversalTime();
                query = query.Where(a => a.Timestamp <= toUtc);
            }

            // 3. User Filter
            if (filter.UserId.HasValue)
            {
                query = query.Where(a => a.UserId == filter.UserId.Value);
            }

            // 4. Module Filter
            if (!string.IsNullOrWhiteSpace(filter.Module))
            {
                var mod = filter.Module.Trim();
                query = query.Where(a => a.Module == mod);
            }

            // 5. Action Filter
            if (!string.IsNullOrWhiteSpace(filter.Action))
            {
                var act = filter.Action.Trim();
                query = query.Where(a => a.Action == act);
            }

            // 6. Success/Failure Filter
            if (filter.IsSuccess.HasValue)
            {
                query = query.Where(a => a.IsSuccess == filter.IsSuccess.Value);
            }

            // 7. Reviewed / Unreviewed Filter
            if (filter.IsReviewed.HasValue)
            {
                query = query.Where(a => a.IsReviewed == filter.IsReviewed.Value);
            }

            var totalCount = await query.CountAsync();

            // 8. Dynamic Sorting
            var isAsc = string.Equals(filter.SortDirection, "asc", StringComparison.OrdinalIgnoreCase);
            var sortBy = filter.SortBy?.Trim().ToLowerInvariant();

            query = sortBy switch
            {
                "module" => isAsc ? query.OrderBy(a => a.Module).ThenByDescending(a => a.Id) : query.OrderByDescending(a => a.Module).ThenByDescending(a => a.Id),
                "action" => isAsc ? query.OrderBy(a => a.Action).ThenByDescending(a => a.Id) : query.OrderByDescending(a => a.Action).ThenByDescending(a => a.Id),
                "userdisplayname" => isAsc ? query.OrderBy(a => a.UserDisplayName).ThenByDescending(a => a.Id) : query.OrderByDescending(a => a.UserDisplayName).ThenByDescending(a => a.Id),
                "issuccess" => isAsc ? query.OrderBy(a => a.IsSuccess).ThenByDescending(a => a.Id) : query.OrderByDescending(a => a.IsSuccess).ThenByDescending(a => a.Id),
                "id" => isAsc ? query.OrderBy(a => a.Id) : query.OrderByDescending(a => a.Id),
                _ => isAsc ? query.OrderBy(a => a.Timestamp).ThenBy(a => a.Id) : query.OrderByDescending(a => a.Timestamp).ThenByDescending(a => a.Id)
            };

            // 9. Server Pagination
            var pageNumber = filter.PageNumber < 1 ? 1 : filter.PageNumber;
            var pageSize = filter.PageSize < 1 ? 10 : (filter.PageSize > 100 ? 100 : filter.PageSize);

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new AuditLogResponseDto
                {
                    Id = a.Id,
                    UserId = a.UserId,
                    UserDisplayName = a.UserDisplayName,
                    Action = a.Action,
                    Module = a.Module,
                    EntityId = a.EntityId,
                    Timestamp = a.Timestamp,
                    IsSuccess = a.IsSuccess,
                    IsReviewed = a.IsReviewed,
                    ReviewedBy = a.ReviewedBy,
                    ReviewedAt = a.ReviewedAt,
                    IpAddress = a.IpAddress,
                    TraceId = a.TraceId,
                    Description = a.Description,
                    BeforeValuesJson = a.BeforeValuesJson,
                    AfterValuesJson = a.AfterValuesJson
                })
                .ToListAsync();

            return new PagedAuditLogResultDto
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<bool> MarkAsReviewedAsync(long id, string adminEmail)
        {
            var log = await _context.AuditLogs.FirstOrDefaultAsync(a => a.Id == id);
            if (log == null) return false;

            log.IsReviewed = true;
            log.ReviewedBy = adminEmail;
            log.ReviewedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> MarkAllAsReviewedAsync(string adminEmail)
        {
            var unreviewed = await _context.AuditLogs
                .Where(a => !a.IsReviewed && !a.IsSuccess)
                .ToListAsync();

            if (unreviewed.Count == 0) return 0;

            var now = DateTime.UtcNow;
            foreach (var log in unreviewed)
            {
                log.IsReviewed = true;
                log.ReviewedBy = adminEmail;
                log.ReviewedAt = now;
            }

            await _context.SaveChangesAsync();
            return unreviewed.Count;
        }
    }
}
