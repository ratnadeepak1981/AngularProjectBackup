using System.Threading.Tasks;

namespace CampusServicesPortal.Repositories.Interfaces
{
    public interface IAuditLogRepository
    {
        // Rule: Commits system actions, access failures, or high-risk administrative state changes to an audit trail
        Task LogActivityAsync(int? studentId, string operationalAction, string clearDetails, string clientIpAddress);
    }
}
