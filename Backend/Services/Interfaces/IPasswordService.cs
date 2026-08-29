using System.Threading.Tasks;
using CampusServicesPortal.DTOs.Requests.Auth;
using CampusServicesPortal.Wrappers;

namespace CampusServicesPortal.Services.Interfaces
{
    public interface IPasswordService
    {
        Task<ServiceResult<object>> ForgotPasswordAsync(ForgotPasswordRequestDto request);
        Task<ServiceResult<object>> ResetPasswordAsync(ResetPasswordRequestDto request);
    }
}
