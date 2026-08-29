using System.Collections.Generic;
using System.Threading.Tasks;
using CampusServicesPortal.DTOs.Requests.MasterData;
using CampusServicesPortal.DTOs.Responses.MasterData;
using CampusServicesPortal.Wrappers;

namespace CampusServicesPortal.Services.Interfaces
{
    public interface ICertificateTypeService
    {
        Task<ServiceResult<IEnumerable<CertificateTypeResponseDto>>> GetAllCertificateTypesAsync();
        Task<ServiceResult<CertificateTypeResponseDto>> CreateCertificateTypeAsync(CreateCertificateTypeRequestDto request);
        Task<ServiceResult<CertificateTypeResponseDto>> UpdateCertificateTypeAsync(int id, UpdateCertificateTypeRequestDto request);
        Task<ServiceResult<object>> DeleteCertificateTypeAsync(int id);
    }
}
