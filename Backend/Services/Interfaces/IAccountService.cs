using System.Threading.Tasks;
using CampusServicesPortal.DTOs.Requests.Auth;
using CampusServicesPortal.DTOs.Responses.Auth;
using CampusServicesPortal.Wrappers;

namespace CampusServicesPortal.Services.Interfaces
{
    public interface IAccountService
    {
        Task<ServiceResult<bool>> VerifyEmailAsync(VerifyEmailRequestDto request);
        Task<ServiceResult<bool>> ResendVerificationEmailAsync(ResendVerificationRequestDto request);
        Task<ServiceResult<object>> SendPhoneOtpAsync(SendPhoneOtpRequestDto request);
        Task<ServiceResult<bool>> VerifyPhoneOtpAsync(VerifyPhoneOtpRequestDto request);
        Task<ServiceResult<DeactivationCheckResponseDto>> CheckDeactivationEligibilityAsync(int studentId);
        Task<ServiceResult<object>> DeactivateAccountAsync(int studentId);
        Task<ServiceResult<object>> ReactivateAccountAsync(int studentId);
    }
}
