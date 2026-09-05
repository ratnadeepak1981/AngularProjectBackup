using System.Threading.Tasks;
using CampusServicesPortal.DTOs.Requests.AuditLogs;
using CampusServicesPortal.DTOs.Responses.AuditLogs;
using CampusServicesPortal.Models;

namespace CampusServicesPortal.Repositories.Interfaces
{
    public interface IAuditLogRepository
    {
        Task AddLogAsync(AuditLog log);
        Task<PagedAuditLogResultDto> GetAuditLogsAsync(AuditLogFilterDto filter);
        Task<AuditLog?> GetAuditLogByIdAsync(long id);
        Task<bool> MarkAsReviewedAsync(long id, string adminEmail);
        Task<int> MarkAllAsReviewedAsync(string adminEmail);
    }
}
