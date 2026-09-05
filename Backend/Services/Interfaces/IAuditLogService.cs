using System.Threading.Tasks;
using CampusServicesPortal.DTOs.Requests.AuditLogs;
using CampusServicesPortal.DTOs.Responses.AuditLogs;
using CampusServicesPortal.Wrappers;

namespace CampusServicesPortal.Services.Interfaces
{
    public interface IAuditLogService
    {
        Task<ServiceResult<PagedAuditLogResultDto>> GetAuditLogsAsync(AuditLogFilterDto filter);
        Task<ServiceResult<AuditLogResponseDto>> GetAuditLogByIdAsync(long id);
        Task<ServiceResult<bool>> MarkAsReviewedAsync(long id, string adminEmail);
        Task<ServiceResult<int>> MarkAllAsReviewedAsync(string adminEmail);
        Task LogActivityAsync(
            int? userId,
            string? userDisplayName,
            string action,
            string module,
            string? entityId,
            string description,
            bool isSuccess = true,
            object? beforeValues = null,
            object? afterValues = null,
            string? ipAddress = null,
            string? traceId = null);
    }
}
