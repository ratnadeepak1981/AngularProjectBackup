using System.Collections.Generic;
using System.Threading.Tasks;
using CampusServicesPortal.DTOs.Requests.Certificates;
using CampusServicesPortal.DTOs.Responses.Certificates;
using CampusServicesPortal.Wrappers;

namespace CampusServicesPortal.Services.Interfaces
{
    public interface ICertificateService
    {
        // Requests transcripts or official administrative letters
        Task<ServiceResult<CertificateResponseDto>> RequestCertificateAsync(int studentId, SubmitCertificateRequestDto request);



        // Flips workflows (e.g. "Ready for Collection")
        Task<ServiceResult<CertificateResponseDto>> UpdateRequestStatusAsync(int requestId, UpdateCertificateStatusDto request);

        // Operational ledger check lookups
        Task<ServiceResult<IEnumerable<CertificateResponseDto>>> GetStudentRequestsAsync(int studentId);


        Task<ServiceResult<IEnumerable<CertificateResponseDto>>> GetRequestsAsync(string? status);
    }
}
