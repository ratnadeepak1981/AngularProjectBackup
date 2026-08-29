using System.Collections.Generic;
using System.Threading.Tasks;
using CampusServicesPortal.Models;

namespace CampusServicesPortal.Repositories.Interfaces
{
    public interface ICertificateRepository
    {
        Task<bool> StudentExistsAsync(int studentId);

        Task<CertificateType?> GetCertificateTypeByIdAsync(int certificateTypeId);

        Task<CertificateRequest?> GetRequestByIdAsync(int requestId);

        Task<IEnumerable<CertificateRequest>> GetRequestsByStudentIdAsync(int studentId);

        Task<IEnumerable<CertificateRequest>> GetRequestsAsync(string? status);

        Task<bool> HasPendingDuplicateAsync(int studentId, int certificateTypeId);

        Task AddRequestAsync(CertificateRequest request);

        Task SaveChangesAsync();
    }
}
