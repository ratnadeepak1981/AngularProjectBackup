using System.Threading.Tasks;
using CampusServicesPortal.DTOs.Requests.Auth;
using CampusServicesPortal.DTOs.Responses.Auth;
using CampusServicesPortal.Wrappers;

namespace CampusServicesPortal.Services.Interfaces
{
    public interface IAuthService
    {
        Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginRequestDto request);
        Task<ServiceResult<AuthResponseDto>> RefreshTokenAsync(RefreshTokenRequestDto request);
        Task<ServiceResult<bool>> RevokeTokenAsync(RevokeTokenRequestDto request);
    }
}
